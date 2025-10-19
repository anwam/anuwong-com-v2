---
title: Redis บันทึกการใช้งาน Set และ Sorted Set (ZSET)
description: "เมื่อ List และ Hash ไม่พอ: ทำความเข้าใจคุณสมบัติเฉพาะตัวของข้อมูลชนิด Set และ ZSET และแนวทางการนำไปใช้งานเพื่อแก้ปัญหาทางธุรกิจบางอย่าง ที่อาจช่วยตอบโจทย์คุณได้"
date: 2025-10-19T07:28:39.845Z
preview: /src/assets/images/redis-logo-full-color-rgb.webp
draft: false
tags:
    - redis
    - data-structures
---

## ทำไมต้อง Set และ Sorted Set?

เมื่อคุณต้องการเก็บข้อมูลที่ไม่ซ้ำกัน (Unique) หรือต้องการเก็บข้อมูลที่เรียงลำดับตามคะแนน (Score) List หรือ Hash ของ Redis อาจจะไม่ตอบโจทย์ บทความนี้จะเจาะลึกโครงสร้างข้อมูล Set และ Sorted Set (ZSET) ซึ่งเป็นเครื่องมือทรงพลังสำหรับการจัดการความสัมพันธ์ของข้อมูล

## Redis Set (SADD, SMEMBERS, SISMEMBER)

Redis Set คือคอลเลกชันของสตริงที่ไม่ซ้ำกัน โดยไม่มีลำดับ (Unordered Collection of Unique Strings) คล้ายกับ Set ทางคณิตศาสตร์

### คุณสมบัติหลัก:
1. ความไม่ซ้ำกัน (Uniqueness): ข้อมูลที่ถูกเพิ่มซ้ำจะไม่ถูกเก็บซ้ำใน Set
2. การดำเนินการทางคณิตศาสตร์: สามารถทำ Union (รวม), Intersection (หาจุดร่วม), และ Difference (หาความแตกต่าง) ระหว่าง Set ได้อย่างรวดเร็ว (Time Complexity *O(N)* เมื่อ *N* คือจำนวนสมาชิกที่เล็กที่สุด)


### ตัวอย่างการใช้งาน Set

#### การจัดการสิทธิ์ผู้ใช้ (User Permissions)

| คำสั่ง | คำอธิบาย |
|------|---------|
| `SADD admins user:anuwong user:jane` | เพิ่มผู้ใช้ anuwong และ jane เข้าในกลุ่ม admins |
| `SADD editors user:jane user:peter` | เพิ่ม jane และ peter เข้าในกลุ่ม editors |
| `SISMEMBER admins user:anuwong` | ตรวจสอบว่า anuwong เป็น Admin หรือไม่ (ผลลัพธ์: 1/True) |
| `SINTER admins editors` | หาผู้ใช้ที่เป็นทั้ง Admin และ Editor (ผลลัพธ์: user:jane) |

## Redis Sorted Set (ZADD, ZRANGE, ZRANK)

Redis Sorted Set (ZSET) เป็นโครงสร้างข้อมูลที่มีคุณสมบัติของทั้ง Set (สมาชิกไม่ซ้ำกัน) และ Skip List (เรียงลำดับ)

### คุณสมบัติหลัก
1. Unique Members + Score: แต่ละสมาชิกต้องไม่ซ้ำกัน และมีค่า Score เป็นตัวเลข (Floating Point Number) กำหนดอยู่
2. เรียงลำดับอัตโนมัติ: สมาชิกทั้งหมดจะถูกเรียงลำดับจากน้อยไปมากตามค่า Score โดยอัตโนมัติ

### ตัวอย่างการใช้งาน Sorted Set

#### Leaderboard หรือ Ranking System

| คำสั่ง | คำอธิบาย |
|------|---------|
| ZADD leaderboard 1500 user:anuwong | เพิ่ม anuwong ด้วยคะแนน 1500 |
| ZADD leaderboard 2200 user:peter | เพิ่ม peter ด้วยคะแนน 2200 |
| ZRANGE leaderboard 0 9 WITHSCORES | ดึง 10 อันดับแรกของ Leaderboard (เรียงจากน้อยไปมาก) |
| ZREVRANGE leaderboard 0 9 WITHSCORES | ดึง 10 อันดับสูงสุด (เรียงจากมากไปน้อย) |
| ZRANK leaderboard user:peter | ค้นหาอันดับ (Index) ของ peter จากลำดับที่น้อยที่สุด |