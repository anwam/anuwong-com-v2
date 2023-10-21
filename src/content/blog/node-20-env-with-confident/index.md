---
title: ลองใช้ Built-in env file ใน Node 20
description: Node 20 ได้มีการรองรับ env file แบบ Built-in มาดูกันว่าเราจะใช้งาน environment variables อย่างมั่นใจได้อย่างไร
date: 2023-10-21T17:24:49.966Z
preview: ./image-1.png
draft: false
tags:
  - nodejs
  - env
  - zod
lastmod: 2023-10-21T17:24:49.966Z
---

ก่อนหน้านี้การทำงานกับ .env file บน nodejs เราจะต้องใช้แพ็กเพจที่ชื่อว่า `dotenv` ช่วย เพราะเค้าเขียนมาดี จัดการการอ่าน config อะไรให้หมด จบในแพ็กเกจเดียว

แต่ใน Node 20 ที่กำลังจะ Release ในวันที่ 24 ตุลานี้ เค้ามี Built-in env file มาให้โดยไม่ต้องติดตั้งอะไรเพิ่ม ก็เลยอยากมาลองใช้ดูว่าแจ่มแมวมั้ย ประหยัด package ที่ต้อง maintain version ไปอีกหนึ่ง

เริ่มกันเลย

## ก่อนอื่น ติดตั้ง Node 20 ก่อน

เราใช้ volta ในการจัดการ Node version

```sh
mkdir node-20-env
cd node-20-env
npm init -y
volta pin node@20
touch index.js
```

ยาวหน่อย แต่สรุปก็คือ สร้างโฟลเดอร์สำหรับโปรเจคใหม่ initialize npm package และปัก node@20 เป็น node version ที่เราจะใช้ในโปรเจคนี้ด้วย volta นั่นเอง

> ใครยังไม่เคยใช้หรือยังไม่รู้จัก volta ตามไป[อ่านได้ที่นี่](/blog/use-volta-to-lock-nodejs-version)

## สร้าง env file

```txt
# .env
PORT=3000
APP_NAME=Node 20 with built-in env file
```

## เตรียมฟังก์ชั่นสำหรับเอาค่าจาก env มาใช้ในแอพ

ในครั้งที่เราจะใช้ `zod` มาช่วยในการทำ env validation เพื่อให้เรามั่นใจจริงๆ ว่า env ที่แอพจะนำไปใช้นั้นถูกต้องจริงๆ

ก่อนอื่นก็ต้องติดตั้ง `zod` ก่อน

```sh
npm i zod
```

จากนั้นเขียนฟังก์ชั่นสำหรับอ่านและ validate env

```js
// env.js

import { z } from "zod";

/**
 * @typedef {object} Env
 * @property {string} APP_NAME
 * @property {number} PORT
 */
export const envSchema = z.object({
  APP_NAME: z.string(),
  PORT: z.number(),
});

/**
 * @type {Env}
 */
export const env = envSchema.parse(process.env);
```

> หลังๆ มาถ้าเป็นโปรเจคส่วนตัวไม่ได้ทำงานร่วมกับใคร ผมจะใช้เพียง JavaScript เพราะขี้เกียจ แต่จะใช้ JSDoc เขียนกำกับเอาไว้แทน สะดวกดี

จากนั้นใน `index.js` ที่เราสร้างเอาไว้ตอนต้น ให้เรา import env มาใช้งาน

```js
// index.js

function main() {
  console.log("Hello, this is ", env.APP_NAME, " running on port ", env.PORT);
}

main();
```

## ลองรันดู

```sh
node --env-file=.env index.js
```

ผลลัพธ์ที่ได้

```sh
Hello, this is  Node 20 with built-in env file  running on port  3000
```

## เซ็ท scripts ใน package.json

```json
{
  "scripts": {
    "start": "node --env-file=.env index.js"
  }
}
```

## ลองรันดูอีกที

```sh
npm start
```

ผลลัพธ์ที่ได้

```sh
Hello, this is  Node 20 with built-in env file  running on port  3000
```

## สรุป

เป็นไงบ้างกับความสามารถของ Node 20 สะดวกเลยใช่มั้ยล่ะ เท่าที่ใช้งานเบื้องต้นแบบไม่มีท่าพิศดาร ก็ยังไม่เจอข้อจำกัดอะไร แต่ยังไม่ได้ลองการใช้งานอื่นๆด้วย เช่น อ่าน env หลายๆ ไฟล์ได้หรือมั้ย การ merge env files จัดการยังไง

ยังไงก็นำไปทดลองใช้งานดู ขอให้สนุกกับการเขียนโค้ดครับ
