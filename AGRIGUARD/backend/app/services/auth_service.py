import os
import json
import uuid
import time
import secrets
import hashlib
import smtplib
from email.message import EmailMessage
from datetime import datetime
from typing import Dict, Any, Optional, List
from ..core.config import settings

class AuthService:
    def __init__(self):
        self.users_file = os.path.join(settings.DATA_DIR, "users.json")
        self.tokens_file = os.path.join(settings.DATA_DIR, "reset_tokens.json")
        self._init_files()

    def _init_files(self):
        if not os.path.exists(self.users_file):
            self._save_json(self.users_file, [])
        if not os.path.exists(self.tokens_file):
            self._save_json(self.tokens_file, {})

    def _read_json(self, path: str) -> Any:
        # Retry up to 3 times to handle transient file locks (common on Windows with cloud sync)
        for attempt in range(3):
            try:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        return json.load(f)
                break
            except Exception as e:
                if attempt < 2:
                    time.sleep(0.05)
                    continue
                print(f"[AuthService] Error reading {path} on attempt {attempt+1}: {e}")
                # Try fallback backup file if available
                bak_path = path + ".bak"
                if os.path.exists(bak_path):
                    try:
                        with open(bak_path, "r", encoding="utf-8") as bf:
                            print(f"[AuthService] Successfully recovered data from backup: {bak_path}")
                            return json.load(bf)
                    except Exception as be:
                        print(f"[AuthService] Backup read also failed: {be}")
        return [] if "users" in path else {}

    def _save_json(self, path: str, data: Any):
        # Atomic write pattern with backup to prevent corruption on Windows/OneDrive
        tmp_path = f"{path}.tmp.{os.getpid()}_{int(time.time()*1000)}"
        bak_path = f"{path}.bak"
        try:
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.flush()
                os.fsync(f.fileno())

            # Create backup of current version before replacing
            if os.path.exists(path):
                try:
                    import shutil
                    shutil.copy2(path, bak_path)
                except Exception:
                    pass

            # Atomic replace
            os.replace(tmp_path, path)
        except Exception as e:
            print(f"[AuthService] Error writing {path}: {e}")
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
            raise

    def check_db_health(self) -> Dict[str, Any]:
        """
        Verifies database accessibility, file validity, and writability without modifying user data.
        """
        try:
            if not os.path.exists(settings.DATA_DIR):
                return {"healthy": False, "error": f"Storage directory not found: {settings.DATA_DIR}"}
            users = self._read_json(self.users_file)
            if not isinstance(users, list):
                return {"healthy": False, "error": "Users database corrupted or not a list"}
            
            # Test write access with a dummy probe file
            test_file = os.path.join(settings.DATA_DIR, f".probe_{os.getpid()}_{int(time.time())}.tmp")
            with open(test_file, "w", encoding="utf-8") as f:
                f.write("probe")
            if os.path.exists(test_file):
                os.remove(test_file)
                
            return {
                "healthy": True,
                "users_count": len(users),
                "storage_dir": settings.DATA_DIR,
                "writable": True
            }
        except Exception as e:
            return {"healthy": False, "error": str(e)}

    # Password Hashing using PBKDF2 with SHA-256 and unique salt
    def _hash_password(self, password: str) -> str:
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return f"{salt}${pwd_hash}"

    def _verify_password(self, password: str, stored_hash: str) -> bool:
        try:
            salt, hash_val = stored_hash.split('$')
            test_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000
            ).hex()
            return secrets.compare_digest(hash_val, test_hash)
        except Exception:
            return False

    def clean_mobile(self, mobile: str) -> str:
        # Strip spaces, dashes, +91 prefix, leading zeros
        cleaned = "".join(filter(str.isdigit, str(mobile or "")))
        if len(cleaned) == 12 and cleaned.startswith("91"):
            cleaned = cleaned[2:]
        elif len(cleaned) == 11 and cleaned.startswith("0"):
            cleaned = cleaned[1:]
        elif len(cleaned) > 10 and cleaned.startswith("91"):
            cleaned = cleaned[-10:]
        elif len(cleaned) > 10 and cleaned.startswith("0"):
            cleaned = cleaned.lstrip("0")
        elif len(cleaned) == 10 and cleaned.startswith("0"):
            cleaned = cleaned.lstrip("0")
        return cleaned

    # 1. Registration
    def register_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        mobile = self.clean_mobile(data.get("mobile", ""))
        email = data.get("email", "").strip().lower()
        full_name = data.get("full_name", "").strip()
        state = data.get("state", "").strip()
        district = data.get("district", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        preferred_language = data.get("preferred_language", "ta")

        # Validation
        if len(mobile) != 10:
            return {
                "success": False,
                "message": "Please enter a valid 10-digit mobile number.",
                "message_ta": "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
                "message_hi": "कृपया एक मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।"
            }

        if password != confirm_password:
            return {
                "success": False,
                "message": "Passwords do not match.",
                "message_ta": "கடவுச்சொற்கள் பொருந்தவில்லை.",
                "message_hi": "पासवर्ड मेल नहीं खाते हैं।"
            }

        if len(password) < 6:
            return {
                "success": False,
                "message": "Password must be at least 6 characters long.",
                "message_ta": "கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.",
                "message_hi": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
            }

        users = self._read_json(self.users_file)
        if not isinstance(users, list):
            users = []

        # Check duplicate mobile and duplicate email with normalized comparison
        for u in users:
            stored_mob = self.clean_mobile(u.get("mobile", ""))
            if stored_mob and stored_mob == mobile:
                return {
                    "success": False,
                    "field": "mobile",
                    "error_code": "DUPLICATE_MOBILE",
                    "message": "An account with this mobile number already exists. Please sign in.",
                    "message_ta": "இந்த மொபைல் எண்ணில் ஏற்கனவே ஒரு கணக்கு உள்ளது. உள்நுழையவும்.",
                    "message_hi": "इस मोबाइल नंबर के साथ एक खाता पहले से मौजूद है। कृपया साइन इन करें।"
                }
            stored_mail = u.get("email", "").strip().lower()
            if stored_mail and stored_mail == email:
                return {
                    "success": False,
                    "field": "email",
                    "error_code": "DUPLICATE_EMAIL",
                    "message": "An account with this email address already exists. Please sign in.",
                    "message_ta": "இந்த மின்னஞ்சல் முகவரியில் ஏற்கனவே ஒரு கணக்கு உள்ளது. உள்நுழையவும்.",
                    "message_hi": "इस ईमेल पते के साथ एक खाता पहले से मौजूद है। कृपया साइन इन करें।"
                }

        # Create user
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.now().isoformat()
        new_user = {
            "id": user_id,
            "full_name": full_name,
            "mobile": mobile,
            "email": email,
            "state": state,
            "district": district,
            "password_hash": self._hash_password(password),
            "preferred_language": preferred_language,
            "created_at": now_iso
        }
        users.append(new_user)
        self._save_json(self.users_file, users)

        # Generate session token
        session_token = f"agri_tok_{secrets.token_urlsafe(32)}"

        user_profile = {
            "id": user_id,
            "full_name": full_name,
            "mobile": mobile,
            "email": email,
            "state": state,
            "district": district,
            "preferred_language": preferred_language,
            "created_at": now_iso
        }

        try:
            from .farm_store import farm_store
            farm_store.update_profile({"farmer_name": full_name})
        except Exception:
            pass

        return {
            "success": True,
            "message": "Account created successfully! Welcome to AGRIGUARD.",
            "message_ta": "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! அக்ரிகார்ட்டிற்கு வரவேற்கிறோம்.",
            "message_hi": "खाता सफलतापूर्वक बनाया गया! एग्रीगार्ड में आपका स्वागत है।",
            "token": session_token,
            "user": user_profile
        }

    # 2. Login
    def login_user(self, mobile_input: str, password_input: str) -> Dict[str, Any]:
        raw_id = str(mobile_input or "").strip()
        cleaned_mobile = self.clean_mobile(raw_id)
        is_email = "@" in raw_id
        users = self._read_json(self.users_file)
        if not isinstance(users, list):
            users = []

        found_user = None
        for u in users:
            # 1. Match email if input contains '@'
            if is_email and u.get("email", "").strip().lower() == raw_id.lower():
                found_user = u
                break
            # 2. Match cleaned mobile number or raw mobile
            stored_mob = self.clean_mobile(u.get("mobile", ""))
            if cleaned_mobile and stored_mob and (stored_mob == cleaned_mobile or u.get("mobile", "").strip() == raw_id):
                found_user = u
                break
            # 3. Direct email match even without '@'
            if u.get("email", "").strip().lower() == raw_id.lower():
                found_user = u
                break

        if not found_user:
            return {
                "success": False,
                "field": "mobile",
                "error_code": "USER_NOT_FOUND",
                "message": "No account found with this mobile number or email. Please check your credentials or create an account.",
                "message_ta": "இந்த மொபைல் எண் அல்லது மின்னஞ்சலில் கணக்கு எதுவும் இல்லை. சரிபார்க்கவும் அல்லது புதிய கணக்கு தொடங்கவும்.",
                "message_hi": "इस मोबाइल नंबर या ईमेल के साथ कोई खाता नहीं मिला। कृपया जांचें या नया खाता बनाएं।"
            }

        if not self._verify_password(password_input, found_user.get("password_hash", "")):
            return {
                "success": False,
                "field": "password",
                "error_code": "INVALID_PASSWORD",
                "message": "Incorrect password. Please try again or use Forgot Password.",
                "message_ta": "தவறான கடவுச்சொல். மீண்டும் முயற்சிக்கவும் அல்லது கடவுச்சொல்லை மீட்டெடுக்கவும்.",
                "message_hi": "गलत पासवर्ड। कृपया पुनः प्रयास करें या 'पासवर्ड भूल गए' का उपयोग करें।"
            }

        session_token = f"agri_tok_{secrets.token_urlsafe(32)}"
        user_profile = {
            "id": found_user["id"],
            "full_name": found_user["full_name"],
            "mobile": found_user["mobile"],
            "email": found_user["email"],
            "state": found_user["state"],
            "district": found_user["district"],
            "preferred_language": found_user.get("preferred_language", "ta"),
            "created_at": found_user.get("created_at", "")
        }

        try:
            from .farm_store import farm_store
            farm_store.update_profile({"farmer_name": found_user["full_name"]})
        except Exception:
            pass

        return {
            "success": True,
            "message": f"Welcome back, {found_user['full_name']}!",
            "message_ta": f"மீண்டும் வருக, {found_user['full_name']}!",
            "message_hi": f"वापसी पर स्वागत है, {found_user['full_name']}!",
            "token": session_token,
            "user": user_profile
        }

    # 3. Forgot Password - Generate secure reset token & send email
    def request_password_reset(self, email_input: str, base_url: str = "http://localhost:5173") -> Dict[str, Any]:
        email = email_input.strip().lower()
        users = self._read_json(self.users_file)
        if not isinstance(users, list):
            users = []

        user = next((u for u in users if u.get("email") == email), None)
        if not user:
            return {
                "success": False,
                "email_sent": False,
                "message": "No account registered with this email address. Please verify your email.",
                "message_ta": "இந்த மின்னஞ்சல் முகவரியில் பதிவு செய்யப்பட்ட கணக்கு எதுவும் இல்லை.",
                "message_hi": "इस ईमेल पते के साथ कोई पंजीकृत खाता नहीं है। कृपया ईमेल जांचें।"
            }

        # Generate secure random token
        token = secrets.token_urlsafe(32)
        tokens_map = self._read_json(self.tokens_file)
        if not isinstance(tokens_map, dict):
            tokens_map = {}

        # 60 minute expiry
        tokens_map[token] = {
            "user_id": user["id"],
            "email": email,
            "expires_at": time.time() + 3600,
            "created_at": datetime.now().isoformat()
        }
        self._save_json(self.tokens_file, tokens_map)

        reset_url = f"{base_url}/?reset_token={token}"

        # Attempt actual email sending if SMTP configured
        email_sent = self._send_reset_email(email, user["full_name"], reset_url)

        return {
            "success": True,
            "email_sent": email_sent,
            "message": "A secure password-reset link has been sent to your email address.",
            "message_ta": "உங்கள் மின்னஞ்சல் முகவரிக்கு கடவுச்சொல் மாற்றும் இணைப்பு அனுப்பப்பட்டுள்ளது.",
            "message_hi": "आपके ईमेल पते पर एक सुरक्षित पासवर्ड रीसेट लिंक भेजा गया है।",
            "reset_token": token,
            "reset_url": reset_url
        }

    def _send_reset_email(self, recipient_email: str, recipient_name: str, reset_url: str) -> bool:
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")

        if not (smtp_host and smtp_user and smtp_password):
            print(f"\n[AGRIGUARD PASSWORD RESET EMAIL NOTICE]")
            print(f"Recipient: {recipient_name} <{recipient_email}>")
            print(f"Reset Link: {reset_url}\n")
            return False

        try:
            msg = EmailMessage()
            msg["Subject"] = "AGRIGUARD — Reset Your Password / உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்"
            msg["From"] = f"AGRIGUARD Support <{smtp_user}>"
            msg["To"] = recipient_email
            
            body = f"""Hello {recipient_name},

We received a request to reset your AGRIGUARD farmer account password.

Click the secure link below to choose a new password:
{reset_url}

This link is valid for 60 minutes. If you did not request this, please disregard this email.

---
விவசாயிகளுக்கான அக்ரிகார்ட் செயலி
AGRIGUARD — AI Farmer Companion
"""
            msg.set_content(body)

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"[AuthService] Error sending email via SMTP: {e}")
            return False

    # 4. Reset Password
    def reset_password(self, token: str, new_password: str, confirm_password: str) -> Dict[str, Any]:
        if new_password != confirm_password:
            return {
                "success": False,
                "message": "New passwords do not match.",
                "message_ta": "புதிய கடவுச்சொற்கள் பொருந்தவில்லை.",
                "message_hi": "नए पासवर्ड मेल नहीं खाते हैं।"
            }

        if len(new_password) < 6:
            return {
                "success": False,
                "message": "Password must be at least 6 characters long.",
                "message_ta": "கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.",
                "message_hi": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
            }

        tokens_map = self._read_json(self.tokens_file)
        if not isinstance(tokens_map, dict) or token not in tokens_map:
            return {
                "success": False,
                "message": "Invalid or expired password reset link. Please request a new one.",
                "message_ta": "தவறான அல்லது காலாவதியான இணைப்பு. தயவுசெய்து மீண்டும் கோரவும்.",
                "message_hi": "अमान्य या समाप्त हो चुका रीसेट लिंक। कृपया नया लिंक अनुरोध करें।"
            }

        token_info = tokens_map[token]
        if time.time() > token_info.get("expires_at", 0):
            del tokens_map[token]
            self._save_json(self.tokens_file, tokens_map)
            return {
                "success": False,
                "message": "This password reset link has expired. Please request a new one.",
                "message_ta": "இந்த இணைப்பு காலாவதியாகிவிட்டது. மீண்டும் புதிய இணைப்பு கோரவும்.",
                "message_hi": "यह पासवर्ड रीसेट लिंक समाप्त हो गया है। कृपया नया लिंक अनुरोध करें।"
            }

        user_id = token_info.get("user_id")
        users = self._read_json(self.users_file)
        if not isinstance(users, list):
            users = []

        user = next((u for u in users if u.get("id") == user_id), None)
        if not user:
            return {
                "success": False,
                "message": "User account not found.",
                "message_ta": "பயனர் கணக்கு காணப்படவில்லை.",
                "message_hi": "उपयोगकर्ता खाता नहीं मिला।"
            }

        # Update password hash
        user["password_hash"] = self._hash_password(new_password)
        user["password_updated_at"] = datetime.now().isoformat()
        self._save_json(self.users_file, users)

        # Invalidate token so it cannot be reused
        del tokens_map[token]
        self._save_json(self.tokens_file, tokens_map)

        return {
            "success": True,
            "message": "Password has been successfully reset! You can now sign in with your new password.",
            "message_ta": "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! இப்போது உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.",
            "message_hi": "पासवर्ड सफलतापूर्वक रीसेट हो गया है! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।"
        }

auth_service = AuthService()
