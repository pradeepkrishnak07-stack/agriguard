with open('frontend/src/services/spokenContentBuilder.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

ood_lines = [
    "  // Handle uncertain or out-of-distribution leaf images cleanly without false diagnosis\n",
    "  if (result.is_out_of_distribution || result.is_uncertain) {\n",
    "    if (isTa) {\n",
    "      return cleanTamilSpokenText(\n",
    "        result.explanation_ta ||\n",
    '          "கவனிக்கவும்: பதிவேற்றப்பட்ட இலை படத்தை தற்போதைய மாதிரியால் திட்டவட்டமாக வகைப்படுத்த முடியவில்லை. இது ஆதரிக்கப்படாத தாவர வகையாக இருக்கலாம் அல்லது படம் தெளிவின்றி இருக்கலாம். தெளிவான படத்தை பதிவேற்றவும் அல்லது உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்."\n',
    "      );\n",
    "    }\n",
    "    if (isHi) {\n",
    "      return (\n",
    "        result.explanation_hi ||\n",
    '        "सूचना: अपलोड की गई पत्ती की तस्वीर को वर्तमान मॉडल द्वारा विश्वसनीय रूप से वर्गीकृत नहीं किया जा सकता है। कृपया स्पष्ट तस्वीर लें या स्थानीय कृषि विशेषज्ञ से परामर्श करें।"\n',
    "      );\n",
    "    }\n",
    "    return (\n",
    "      result.explanation_en ||\n",
    '      "Notice: The uploaded leaf image cannot be reliably classified using the current model. It may belong to an unsupported plant species or have insufficient clarity. Please upload a clear photo taken in natural light or consult a local agricultural extension officer."\n',
    "    );\n",
    "  }\n",
    "\n"
]

target_idx = None
for i, l in enumerate(lines):
    if l.strip() == 'if (isTa) {' and i < 300:
        target_idx = i
        break

if target_idx is not None:
    new_lines = lines[:target_idx] + ood_lines + lines[target_idx:]
    with open('frontend/src/services/spokenContentBuilder.ts', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Successfully inserted OOD speech handling at line {target_idx}!")
else:
    print("Could not find target line")
