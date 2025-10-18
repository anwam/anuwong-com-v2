---
title: ทำ Transaction ใน redis ด้วย MULTI และ WATCH
description: งานที่ผมทำเราเจอ use case ที่มีการเขียน Redis Key เดียวกันพร้อมๆ กัน จนเกิด Race condition ในบทความนี้จะมาเล่าการใข้งาน MULTI และ WATCH ในการแก้ปัญหานี้กัน
date: 2024-01-29T11:50:59.437Z
draft: false
tags:
  - redis
  - database
lastmod: 2024-01-29T11:51:03.441Z
preview: ./redis-logo-full-color-rgb.webp
---

ในระบบงานที่ผมดูแล มี workers 2 ตัว ที่จะคอย obverve job นึงอยู่ เมื่อมี event เข้ามา จะไปทำการ Query ข้อมูลจาก Oracle แล้วทำการ set cache ไปที่ Redis ตาม uuid ของผู้ใช้ ซึ่งก่อนหน้านี้มี worker เพียงตัวเดียวที่ observe event นี้ เมื่อเวลาผ่านไป ทีมได้พัฒนา worker อีกตัวมาทำงานใหม่ แต่ปัญหาเกิดเมื่อ workers ทั้ง 2 ตัวดันทำงานเดียวกันพร้อมๆ กัน โดย 90% ของ process ไม่เหมือนกัน มีเพียง 10% เท่านั้นที่มีการทำงานซ้ำซ้อนกัน ดังนั้นทีมจึงเลือกที่จะป้องกัน Race condition ในจังหวะที่ set cache ลง redis แทนที่จะแก้ process ใหม่ทั้งหมด

## ทำ Transaction ใน Redis ด้วย MULTI

ถ้าเราต้องการให้โปรแกรมเรียกใช้คำสั่ง Redis หลายๆ คำสั่งในครั้งเดียว การใช้ `MULTI` และ `EXEC` จะเป็นการเปิด Transaction และคำการเข้า Queue คำสั่งต่อๆ มา โดยจะทำงานเมื่อสั่ง `EXEC` หรือยกเลิกทั้ง Transaction เมื่อสั่ง `DISCARD`

ตัวอย่าง

```sh
> MULTI
OK
> INCR foo
QUEUED
> INCR bar
QUEUED
> EXEC
1) (integer) 1
2) (integer) 1
```

แต่ข้อควรระวังคือ ถ้า Commands ไหนเกิด Error Commands อื่นๆ ก็จะยังทำงานต่อตามปกติ แล้วเราจะได้ Error นั้น Return มาจาก Command `EXEC` ดังเช่นตัวอย่าง

```sh
MULTI
+OK
SET a abc
+QUEUED
LPOP a
+QUEUED
EXEC
*2
+OK
-WRONGTYPE Operation against a key holding the wrong kind of value
```

แล้วถ้าเราอยากฝให้มันทำงานแบบ check-and-set (CAS) ล่ะ ทำยังไง

## ป้องกันการ Update Key เดียวกันซ้ำด้วย WATCH

ถ้าในระบบงานเรามีโอกาสที่ Redis Client หลายๆ ตัวสามารถ `SET` หรือ update ค่าของ key เดียวกันพร้อมๆ กันได้ในเวลาเดียวกัน เราอยากจะมั่นใจก่อนว่า ก่อนจะ update ทำทำการ check ว่า key นี้ถูกเปลี่ยนค่าไปไหม Command `WATCH` จะเข้ามาช่วยตรงนี้

`WATCH` จะทำการ monitor ค่าของ key ที่เราต้องการ โดยหากในระหว่างคำสั่ง `WATCH` จนถึง `EXEC` เกิดมี Redis Client ตัวอื่นมา update value ของ key ที่เรา `WATCH` เอาไว้ จะเกิดเออเร่อเมื่อสั่ง `EXEC` ซึ่ง Transaction ทั้งหมดจะ fail นั่นเอง

สิ่งที่ `WATCH` ทำก็คือ สั่งให้ Redis ตรวจสอบค่าของ Key ที่เราสนใจว่าค่าจะต้องเหมือนเดิม (สามารถ watch ได้มากกว่า 1 key) ถ้าเกิดมี key ใดถูกแก้ไขเมื่อเราสั่ง `EXEC` Transaction นั้นจะถูกยกเลิกทันที

```sh
WATCH mykey
val = GET mykey
val = val + 1
MULTI
SET mykey $val
EXEC
```

ตัวอย่าง use case ที่ผมนำมา apply คือ เมื่อ workers ทั้ง 2 ตัวจะทำการ update key จาก event ให้ทำการ `WATCH` key ที่ตัวเองจะ update ก่อน (เช่น uuid) จากนั้นเมื่อทั้ง 2 workers ทำการ update key เดียวกันพร้อมกัน จะต้องมีคนใดคนนึงเกิด Error จากนั้นเรา check type ว่า Error นั้นเกิดจาก Watch failed หรือไม่ ถ้าใช่ ให้ทำ process นั้นใหม่ทั้งหมด เป็นต้น

เท่านี้ก็สามารถมี workers ที่ update key เดียวกันโดยที่ไม่เกิด race condition แล้ว แต่ทางที่ดี เราควรวางให้การทำงานของ workers ทั้งสองตัวนี้ไม่ทำงานซ้ำซ้อนกันตั้งแต่แรกน่าจะดีกว่านะ

Happy Coding ครับ
