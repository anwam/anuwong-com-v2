---
title: Optimizt - บีบอัดไฟล์ก่อนอัพโหลด ช่วยเซฟพื้นที่ได้หลาย GB
description: รูปภาพเป็นส่วนสำคัญของข้อมูลที่เว็บไซต์ต้องโหลด มารู้จัก Optimizt เครื่องมือบีบอัดภาพผ่าน Command Line ที่ช่วยลดขนาดไฟล์ก่อนอัปโหลด และเลือกคุณภาพให้เหมาะกับการใช้งานได้
date: 2023-08-21T01:27:13.922Z
preview: ./optimizt.png
draft: false
tags:
  - web
  - optimization
  - tools
lastmod: 2026-11-14T00:00:00.000Z
---

รูปภาพเป็นส่วนสำคัญของข้อมูลที่เว็บไซต์ต้องโหลด มารู้จัก Optimizt เครื่องมือบีบอัดภาพผ่าน Command Line ที่ช่วยลดขนาดไฟล์ก่อนอัปโหลด และเลือกคุณภาพให้เหมาะกับการใช้งานได้

## รูปภาพมีผลต่อปริมาณข้อมูลที่เว็บไซต์ต้องโหลด

ในการใช้งานอินเตอร์เน็ตทุกวันนี้ ส่วนมากเราจะเสพสื่อในรูปแบบของรูปภาพ และ วิดีโอ ซึ่งหลายเว็บไซต์ก็มักจะมีการแสดงผลรูปภาพในแต่ละส่วนของการทำงานแตกต่างกันไป บ้างก็ใช้เป็นภาพเพื่อการตลาด ใช้เป็น Call-to-Action หรืออาจจะใช้เพื่อแสดงสินค้าและบริการ รูปภาพจึงอาจเป็นข้อมูลส่วนใหญ่ที่หน้าเว็บต้องโหลด โดยสัดส่วนจะแตกต่างกันไปในแต่ละเว็บไซต์ การลดขนาดไฟล์รูปภาพช่วยลดปริมาณข้อมูลที่ต้องส่ง และช่วยให้หน้าเว็บโหลดเร็วขึ้นได้

อ้างอิงจาก [web.dev](https://web.dev/learn/images/performance-issues/) ข้อมูลเดือนมิถุนายน 2022 ระบุว่า ขนาดข้อมูลที่โหลดต่อหน้าเว็บมีค่ามัธยฐานประมาณ 2MB โดยรูปภาพคิดเป็นเกือบครึ่งหนึ่ง ตัวเลขนี้เป็นข้อมูลในช่วงเวลานั้น ไม่ใช่สัดส่วนของ traffic ทั้งอินเทอร์เน็ต

## ลดขนาดรูปภาพด้วยการบีบอัด

รูปภาพบนเว็บไซต์ส่วนใหญ่จะอยู่ในรูปแบบของไฟล์นามสกุล JPG, PNG, หรือ WEBP สำหรับเว็บยุคใหม่ อาจจะมาจากระบบ CMS ที่แอดมินอัพโหลดรูปภาพขึ้นมา แล้วหน้าเว็บก็ดึงข้อมูลที่อยู่รูปภาพจาก CDN มาแสดงผล ในหลายครั้งรูปที่ถูกอัพโหลดขึ้นมาและ serve ให้ผู้ใช้นั้นไม่ได้ทำการบีบอัดรูปภาพ หรือไม่ได้ทำการลดขนาดให้เหมาะกับอุปกรณ์มาก่อน ทำให้รูปอาจจะมีความละเอียดที่มากจนเกินไปสำหรับแสดงผลบนเว็บไซต์ หรือไฟล์ที่ใหญ่มากเกินไปสำหรับการโหลดผ่านเน็ตมือถือหรือ Slow 4G

เทคนิคในการลดปริมาณข้อมูลรูปภาพมีหลายวิธี เช่น การทำ Responsive Images โดยเตรียมรูปหลายขนาด แล้วให้เบราว์เซอร์เลือกโหลดขนาดที่เหมาะกับหน้าจอและความหนาแน่นของพิกเซล วิธีนี้ใช้ร่วมกับการบีบอัดไฟล์ได้

มาดูอีกหนึ่งวิธีที่นิยมและทำได้ง่าย คือบีบอัดด้วยโปรแกรม เช่น imagemagick, sharp.js, squoosh หรือ Photoshop แต่วันนี้ผมจะแนะนำอีกหนึ่งโปรแกรมที่ใช้งานได้ง่าย สะดวกสำหรับ developer ที่ถนัดการใช้ Command Line นั่นก็คือ [Optimizt](https://github.com/343dev/optimizt) ซึ่งบีบอัดไฟล์ PNG, JPEG, SVG และ GIF ได้ และสร้างไฟล์ WebP หรือ AVIF จากภาพแบบ raster ได้ด้วย

## วิธีการใช้งาน Optimizt

> อัปเดตพฤศจิกายน 2026: repository ปัจจุบันคือ `343dev/optimizt` และแพ็กเกจสำหรับติดตั้งคือ `@343dev/optimizt` ส่วนภาพและผลการบีบอัดด้านล่างเป็นตัวอย่างจากเวอร์ชันที่ใช้เขียนบทความในปี 2023 ผลลัพธ์จากเวอร์ชันปัจจุบันอาจแตกต่างกัน

### ติดตั้ง Optimizt

```sh
npm i -g @343dev/optimizt
```

### ใช้งาน Optimizt

```sh
optimizt path/to/picture.jpg
```

ค่าเริ่มต้นเป็นการบีบอัดแบบ lossy และคำสั่งข้างต้นจะเขียนทับไฟล์เดิม หากต้องการเก็บต้นฉบับไว้ ให้ระบุ `--output optimized` เพื่อเขียนผลลัพธ์ไปยังโฟลเดอร์อื่น ควรเปรียบเทียบคุณภาพของภาพก่อนนำไปใช้งานจริง

รายละเอียดของ CLI สามารถเข้าไปดูที่ [GitHub](https://github.com/343dev/optimizt) ของทาง Optimizt ได้เลย

### ตัวอย่างการใช้งานจริง

ก่อนที่เราจะ Deploy บทความใหม่ ถ้าบทความมีการใช้รูปภาพ เราก็จะ compress รูปนั้นก่อน เช่น

```sh
ls -l

total 408
drwxr-xr-x  11 anuwong.mon  staff     352 Aug 21 08:30 blog
-rw-r--r--   1 anuwong.mon  staff  206970 Aug 21 08:30 optimizt.png
```

ไฟล์ `optimizt.png` มีขนาด 206,970 bytes หรือประมาณ 202KiB ซึ่งเราจะใช้ Optimizt ในการบีบอัดไฟล์นี้

```sh
optimizt optimizt.png

ℹ Optimizing 1 image (lossy)...
✔ optimizt.png
   202.119 KB → 55.206 KB. Ratio: 73%

ℹ Yay! You saved 146.913 KB (73%)
```

ไฟล์ `optimizt.png` ลดขนาดลงจากประมาณ 202KiB เหลือเพียง 55KiB ซึ่งเป็นการลดขนาดไฟล์ไปถึง 73% และเราจะได้ไฟล์ optimizt.png ที่มีขนาดเล็กลงมาใช้งานแทนไฟล์เดิมได้เลย

![Optimizt Result](./optimizt-result.png)

### ลองบีบอัดเป็น WEBP

```sh
mkdir optimized
optimizt กายแก้ว.jpeg --webp --output optimized
ℹ Converting 1 image (lossy)...
✔ กายแก้ว.jpeg
   50.372 KB → WebP 41.613 KB. Ratio: 17%

ℹ Yay! You saved 8.759 KB (17%)
```

ลองมาเปรียบเทียบระหว่าง 2 ภาพนี้ ที่เราได้จากการบีบอัดด้วย Optimizt กัน

![กายแก้ว.jpeg](./gai-gaew.jpeg)

<p style="text-align:center;">กายแก้ว.jpeg</p>

![กายแก้ว.webp](./gai-gaew.webp)

<p style="text-align:center;">กายแก้ว.webp</p>

> ภาพจาก https://www.bbc.com/thai/articles/c88v6z6wdqwo

ลองอีกครั้งกับภาพจาก Unsplash ที่มีขนาดใหญ่กว่า 1MB

```sh
ls -l
-rw-r--r--  1 anuwong.mon  staff  4143107 Aug 21 10:21 filipe-freitas-unsplash.jpg

optimizt --webp filipe-freitas-unsplash.jpg
ℹ Converting 1 image (lossy)...
✔ filipe-freitas-unsplash.jpg
   3.951 MB → WebP 2.07 MB. Ratio: 48%

ℹ Yay! You saved 1.881 MB (48%)
```

![filipe-freitas-unsplash.jpg](./filipe-freitas-unsplash.jpg)

<p style="text-align:center;">filipe-freitas-unsplash.jpg (JPEG 3.951 MB)</p>

![filipe-freitas-unsplash.webp](./filipe-freitas-unsplash.webp)

<p style="text-align:center;">filipe-freitas-unsplash.webp (WEBP 2.07 MB)</p>

> Photo by <a href="https://unsplash.com/@filipephotographs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Filipe Freitas</a> on <a href="https://unsplash.com/photos/-TnJh0eRegc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

## Summary

- รูปภาพอาจเป็นข้อมูลส่วนใหญ่ที่หน้าเว็บต้องโหลด การลดขนาดไฟล์จึงช่วยประหยัด bandwidth ได้ โดยผลลัพธ์ขึ้นอยู่กับแต่ละเว็บไซต์
- Responsive Images ช่วยให้เบราว์เซอร์เลือกโหลดรูปขนาดที่เหมาะสมกับอุปกรณ์
- Image Optimization & Image Compression ช่วยลดขนาดไฟล์รูปภาพ และเพิ่มความเร็วให้กับเว็บไซต์ได้โดยตรง
- Optimizt เหมาะกับ developer ที่ถนัด Command Line โดยคุณภาพและขนาดไฟล์ที่ได้ขึ้นอยู่กับภาพต้นฉบับ รูปแบบไฟล์ และการตั้งค่าที่เลือก

เพียงใช้เครื่องมือที่เหมาะสม ก็จะช่วยให้เราทำงานได้อย่างมีประสิทธิภาพ และประหยัดเวลาได้มากขึ้น

> Use the right tool for the right job

ขอให้สนุกกับเขียนโค้ดครับ 🤓
