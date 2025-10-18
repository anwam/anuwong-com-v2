---
title: Biome ยุติสงครามระหว่าง ESLint และ Prettier
description: ใครเขียนเว็บต้องเคยใช้หรือรู้จัก ESLint และ Prettier กันมาบ้าง บางครั้งเราต้องมาปวดหัวที่เจ้าสอง Tools นี้มันดันตีกัน วันนี้มารู้จัก Biome ที่จะเข้ามาแทนที่ได้แบบแนบสนิทกัน
date: 2025-10-18T00:00:00Z
draft: false
tags:
  - tools
  - productionity
preview: ./slogan-light-transparent.CUBRXROI_Z1Eswx2.svg
---

## One toolchain for your web project

นี่คือ Headline ของ Biome ที่อยู่ใน Official Website โดยหลักๆการทำงานของ Biome ทำได้ทั้ง Lint, Format, และ Code Analyzer ที่มีประสิทธิภาพสูงมากๆ พัฒนาด้วย Rust และสามารถ Migrate configuration จากทั้ง ESLint และ Prettier ได้

โดย Biome นั้นมีให้ใช้งานได้ทั้งแบบ IDE Extension, Node Package, หรือเรียกใช้แบบ Global CLI ผ่าน npx, bunx ได้แบบโคตรง่าย หรือถ้าใครไม่อยากติดตั้ง Node ก็สามารถติดตั้ง Biome ผ่าน package manager ในรูปแบบ `standalone executable` ได้ เช่น `homebrew` เป็นต้น

## Getting Started

มาลองใช้งานกันดีกว่า

> สำหรับ VSCode Extensions สามารถดาวโหลดได้[ที่นี่](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

### ติดตั้งกันก่อน

เริ่มจากติดตั้ง biome เป็น dev dependencies กัน

```sh
pnpm add --save-dev --save-exact @biomejs/biome
```

จากนั้นเราจะทำการ initialize config ของ biome ในโปรเจคของเรา

```sh
pnpm biome init
```

เราก็จะได้ไฟล์ `biome.json` ซึ่งจะมีคอนฟิกพื้นฐานมาให้ เช่น `linter.enabled` เป็นการเปิด linter และตัว `formatter.enabled` จะเป็น `true` ตั้งแต่ต้น ถ้าหากอยากปิดก็ใส่ value เป็น `false` ได้เลย

วิธีใช้งานก็ง่ายๆ ตัว CLI มีคำสั่งให้ใช้ค่อนข้างเยอะ ส่วนใหญ่ผมก็จะใช้แค่ 2 อันเป็นหลัก

```sh
pnpm biome format --write <files>
```

จะเป้นการสั่ง format ไฟล์

```sh
pnpm biome lint --write <files>
```

จะเป็นการ lint ไฟล์ และจะแก้ให้ด้วย

## Migration

หลายๆ โปรเจคที่เราทำอยู่ก็น่าจะมี configuration file ของ ESLint หรือ Prettier หรือมีทั้งสองไฟล์เลย ทาง biome ก็เตรียมคำสั่งสำหรับ migrate ง่ายๆ มาให้

### Migrate ESLint

```sh
pnpm biome migrate eslint --write
```

เราจะได้ไฟล์ `biome.json` ที่มีการเพิ่มพวก rules จาก eslint เข้ามา

### Migrate Prettier

```sh
pnpm biome migrate prettier --write
```

ไฟล์ `biome.json` เราก็จะมี `formatter` config เพิ่มขึ้นมาสำหรับกำหนด coding style ที่จะใช้อ้างอิงในการทำ formattting

### VSCode Extension

สำหรับการใช้งาน Format on Save บน VSCode ก็ทำได้ง่ายๆ โดยการติดตั้ง Extension ของ Biome

จากนั้นไปที่ไฟล์ที่เราต้องการตั้งค่า Formatter ก็กด `cmd` + `shift` + `P` พิมพ์ `Format Document With ...` แล้วเลือก `Configure Default Formatter...`

จะมี Formatter ที่เราติดตั้งเอาไว้ให้เลือก เช่น Prettier, Biome, หรือ default languauge server ของภาษานั้นๆ ให้เราเลือก `Biome` จบ

สำหรับบทความนี้ก็จบเพียงเท่านี้ ขอให้สนุกกับการเขียนโค้ดนะคร้าบ
