# Monte Lab — Blood Test Analysis SOP

> Standard Operating Procedure สำหรับการวิเคราะห์ผลตรวจเลือดลูกค้า Monte Hair Clinic

## Overview

ระบบวิเคราะห์ผลเลือดแบ่งเป็น 2 ระดับ:

1. **Automatic (Rule-based)** — ระบบวิเคราะห์ทันทีเมื่อ upload PDF
2. **Deep Analysis (Claude Max)** — Operator ใช้ Claude Code วิเคราะห์เพิ่มเติม

ไม่ใช้ Claude API — ใช้ Claude Max subscription ผ่าน Claude Code เท่านั้น

---

## ขั้นตอนการทำงาน

### Step 1: รับ PDF ผลเลือด

- **แหล่งที่มา**: Email (lab.montehair@gmail.com) หรือ Admin upload
- **รูปแบบ PDF**: Bangkok R.I.A Lab (BRIA) เป็นหลัก
- **ข้อมูลที่ต้องอ่าน**: HN, ชื่อ, อายุ, เพศ, วันตรวจ, ห้อง LAB, HN BRIA

### Step 2: Upload + Auto Preview

- ลาก PDF ลงหน้า Upload (หลายไฟล์ได้)
- ระบบอ่าน PDF ด้วย pdfjs-dist → แสดง preview
- แสดง: HN, ชื่อ, วันที่, LAB, จำนวน test ที่ตรวจพบ
- ไม่ต้องกรอกข้อมูลเอง — อ่านจาก PDF อัตโนมัติ

### Step 3: Auto Analysis (Rule-based)

กดปุ่ม "วิเคราะห์ผลเลือด" → ระบบวิเคราะห์ทันที:

| ลำดับ | รายการ | สิ่งที่วิเคราะห์ |
|-------|--------|---------------|
| 1 | **Ferritin** (ธาตุเหล็กสะสม) | ค่าควร > 70ng/mL สำหรับสุขภาพผม |
| 2 | **CBC** (ความสมบูรณ์เม็ดเลือด) | ภาวะเลือดจาง, การอักเสบ |
| 3 | **TSH** (ไทรอยด์) | ไทรอยด์ต่ำ/เป็นพิษ → ผมร่วง |
| 4 | **Testosterone + DHEA-S** | คัดกรอง PCOS, ฮอร์โมนเพศชายสูง |
| 5 | **Vitamin D** | ค่าควร > 40-70ng/mL สำหรับผม |
| 6 | **ANA** | คัดกรองโรคภูมิคุ้มกัน (Lupus) |

### Step 4: Deep Analysis (Claude Max — ถ้าต้องการ)

สำหรับเคสที่ต้องการวิเคราะห์ละเอียดกว่า rule-based:

1. เปิด Claude Code
2. อ่านผลเลือดจาก PDF (หรือ parsed_values ใน DB)
3. ใช้ prompt:

```
วิเคราะห์ผลตรวจเลือดสำหรับคลินิกรักษาผมร่วง Monte Hair Clinic
ผู้ป่วย: [ชื่อ] อายุ [X] ปี เพศ [ชาย/หญิง]

ผลเลือด:
[วาง parsed values]

วิเคราะห์ตาม format ของคลินิก:
1. แต่ละค่าพร้อมคำอธิบายภาษาไทย
2. ค่าที่ผิดปกติ → คำแนะนำการรักษาเฉพาะ (ยาฉีด/ยาทาน/ปรึกษาแพทย์)
3. ความเกี่ยวข้องกับสุขภาพเส้นผม
4. Hair Health Score (0-100)
5. สิ่งที่ต้องทำด่วน
```

4. Copy ผลวิเคราะห์กลับเข้า Report ใน Monte Lab

### Step 5: Doctor Review + Approve

- แพทย์ login → เห็น notification "รออนุมัติ"
- อ่านผลวิเคราะห์ → แก้ไขถ้าจำเป็น
- กด "อนุมัติ" → ลายเซ็นอัตโนมัติ
- หรือกด "ปฏิเสธ" → ระบุเหตุผล

### Step 6: Generate Branded PDF

- ระบบสร้าง PDF สรุปผล (Monte branding)
- ประกอบด้วย: logo, ข้อมูลผู้ป่วย, ตารางผลเลือด, คำวิเคราะห์, ลายเซ็นแพทย์
- ส่งให้ผู้ป่วย / เก็บในระบบ

---

## ตัวอย่างคำแนะนำ (จริงจากคลินิก)

### กรณี Ferritin ต่ำ
```
Ferritin (ค่าธาตุเหล็กสะสม)
ผลตรวจค่าได้ 11.40ng/mL ถือว่าค่อนข้างต่ำมาก
แนะนำให้ทานธาตุเหล็กเสริม
ระดับธาตุเหล็กควรมากกว่า 70ng/mL ถึงจะเพียงพอ
ต่อการทำงานของระบบเซลล์ร่างกายและรากผม
```

### กรณี Vitamin D ต่ำ
```
Vitamin D
ผลตรวจ vitamin D ค่าได้ 28.60ng/mL อยู่ในเกณฑ์ต่ำ
ค่าที่ดีควรเกิน 30ng/mL ขึ้นไป

Vitamin D มีผลควบคุมระบบภูมิคุ้มกัน
และมีผลต่อวงจรของรากผมโดยตรง

ถ้าในร่างกายมี Vitamin D ต่ำ:
- รากผมจะอ่อนแอ
- วงจรผมจะสั้นลง
- ผมหลุดร่วงง่ายขึ้น งอกขึ้นใหม่ช้า

สำหรับปัญหาเส้นผม ค่า Vitamin D ควรเกิน 40-70ng/mL

การรักษา:
- ค่าต่ำมาก → ฉีด Vitamin D 3 เข็ม (ทุก 3 เดือน)
- ค่าต่ำเล็กน้อย → ทาน Vitamin D เสริม
- หลังฉีด/ทาน → ตรวจติดตามค่า
```

### กรณี ANA Positive
```
ANA (การคัดกรองโรคภูมิคุ้มกันทำร้ายตัวเอง)
ผลตรวจ Positive

ANA คือการตรวจหาภูมิคุ้มกันที่ร่างกายสร้างขึ้นมาต่อต้านตัวเอง
ผลบวกเพียงอย่างเดียว ยังไม่สรุปว่าเป็นโรคได้
บางคนมี ANA บวกได้ตลอดชีวิตโดยไม่มีโรค

เฝ้าดูอาการ:
- ปวดข้อ ข้อบวม
- ผื่นแพ้แดด
- ผมร่วงผิดปกติ
- แผลในปาก
- อ่อนเพลียเรื้อรัง

หากมีอาการ → ปรึกษาแพทย์
```

### กรณี Testosterone + DHEA-S สูง
```
Testosterone + DHEA-S (คัดกรองภาวะถุงน้ำในรังไข่)
ผลตรวจพบว่าค่าสูงเล็กน้อย
ค่าปกติไม่ควรเกิน 54 ผลตรวจได้ 65

สังเกตอาการ:
- ประจำเดือนมาผิดปกติ
- สิวขึ้นง่าย

แนะนำ: พบแพทย์สูตินารีเวช ตรวจหาภาวะถุงน้ำในรังไข่
```

---

## Reference Ranges (Monte Hair Clinic)

| Test | ค่าปกติ | ค่าที่ดีสำหรับผม | หน่วย |
|------|---------|----------------|-------|
| Ferritin | 4.63-204 | > 70 | ng/mL |
| Hemoglobin | 12-16 | > 13 | g/dL |
| Hematocrit | 36-47 | > 38 | % |
| TSH | 0.35-4.94 | 0.5-3.0 | uIU/mL |
| Testosterone (F) | 13.84-53.35 | < 54 | ng/dL |
| DHEA-S (F) | 98.8-340 | ในเกณฑ์ | µg/dL |
| Vitamin D | > 30 | 40-70 | ng/mL |
| ANA | Negative | Negative | — |

---

## User Roles & Permissions

| Action | Admin | Doctor | Staff |
|--------|-------|--------|-------|
| Upload PDF | ✅ | ✅ | ❌ |
| View all reports | ✅ | ✅ | ❌ |
| View approved only | ✅ | ✅ | ✅ |
| Run analysis | ✅ | ✅ | ❌ |
| Approve/Reject | ❌ | ✅ | ❌ |
| Insert signature | ❌ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Email fetch settings | ✅ | ❌ | ❌ |

---

## Technical Notes

- **PDF Parser**: pdfjs-dist (client-side, supports Thai fonts)
- **Analysis Engine**: Rule-based TypeScript (monte-analysis.ts)
- **Deep Analysis**: Claude Max subscription via Claude Code (manual)
- **No Claude API key needed** — operator runs Claude Code directly
- **Database**: Supabase (PostgreSQL) with RLS
- **Hosting**: Cloudflare Pages
- **Brand**: Monte teal #00868A, Sukhumvit Set font

---

*Monte Hair Clinic — คลินิกรักษาผมร่วง ผมบาง ฟื้นฟูผมบางอย่างตรงจุด*
