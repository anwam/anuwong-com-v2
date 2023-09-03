---
title: แก้ปัญหา Node.js Projects ใช้หลาย version ด้วย volta.sh
description: ปัญหาเวลาทำงานกับ Node.js based หลายๆ Project แล้วแต่ละ Project ดันต้องการ Node.js คนละเวอร์ชั่นกัน เมื่อก่อนก็ใช้ nvm แต่มันดูเหมือนคนแก่ไปหน่อย ลองมารู้จักกับ volta.sh กันดีกว่า
date: 2023-08-12T05:35:51.589Z
preview: ./volta.png
tags:
  - nodejs
  - volta
  - nvm
lastmod: 2023-08-21T02:06:52.121Z
---

ปัญหาเวลาทำงานกับ Node.js based หลายๆ Project แล้วแต่ละ Project ดันต้องการ Node.js คนละเวอร์ชั่นกัน เมื่อก่อนก็ใช้ nvm แต่มันดูเหมือนคนแก่ไปหน่อย ลองมารู้จักกับ volta.sh กันดีกว่า

## Node.js หลาย Projects ต้องการ Node.js คนละเวอร์ชั่นกับที่เรามี

ในการทำงานเราหลีกเลี่ยงไม่ได้ที่จะต้องกลับไปแก้ Legacy services หรือโปรเจคเก่าๆที่เรา release & forgot ไปนานแล้ว กาลเวลาผ่านไป Node.js ก็ออกเวอร์ชั่นใหม่มาเรื่อยๆ พอจะกลับไปแก้ Project เก่า อ้าว API ดันไม่ backward compatible กันซะงั้น เช่น บาง function ถูก deprecated ไป หรือร้ายแรงสุดคือ ถูกเอาออกไปเลย ใน version ใหม่ไม่มีให้ใช้แล้ว จะให้ไปตามแก้ก็ไม่ได้เขียน unit test เอาไว้อีก (คนบาป) ต้องลง Node.js version 12 ในปีที่ไป version 18 แล้ว หน้าเหลืองปาดเหงื่อกันเลยทีเดียว เดี๋ยวเรามามาลองหา solution กันดีกว่าว่าเราทำยังไงกันได้บ้าง

### ลง Node.js แบบเดิมๆ ด้วย homebrew

```bash
brew install node@12

brew unlink node

brew link node@12 --force --overwrite
```

แบบนี้ เราก็จะใช้ node 12 ได้แล้ว แต่ถ้าเราต้องการใช้ node 14 ก็ต้องลงใหม่อีกที

```bash
brew install node@14

brew unlink node

brew link node@14 --force --overwrite
```

ก็เหมือนจะดีนะ แต่ถ้ามีหลายๆ version แล้วเราต้องสลับไปมา ก็อาจจะเหนื่อยนิดหน่อยละ ต้องมาคอยสลับ version กันไปมาอยู่ตลอดเวลา

### ลง Node.js แบบเดิมๆ ด้วย nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

nvm use 12
# or
nvm use 14
```

เอ้ย ดูง่ายขึ้นเยอะเลย แล้วเป็นปัญหายังไง

ง่ายๆ เลย มันไม่เท่พอ เพราะต้องมาเรียก `nvm use 12` หรือ `nvm use 14` ทุกๆ ครั้งที่สลับโปรเจค (มันไม่คูล)

แต่ก็ดูชีวิตง่ายขึ้นเยอะนะ เดี๋ยวเรามาดู volta.sh กัน

## Volta.sh ช่วยแก้ปัญหายังไง

ก่อนอื่นตามไปที่เว็บไซต์ของเค้าก่อน

[https://volta.sh/](https://volta.sh/)

เวลาเราเรียกคำสั่ง `node ...` shell เรามันจะวิ่งไปหา node binary จาก path ที่เรา config เอาไว้ (bashrc, zshrc) แล้ว node binary นั้นๆ ก็จะทำงานตามที่เราสั่งไปนั่นแหละ

แล้ว volta มาช่วยตรงไหน ต้องเรียกได้ว่าเป็น magic เลยก็ได้ โดย volta จะไปอ่าน package.json ในโปรเจคของเราก่อน ว่าต้องการ node version ไหน ถ้าไม่มี ก็อ้างอิงจาก global version ถ้ามี ก็จะวิ่งไปหา node version นั้นผ่าน `$HOME/.volta/bin/node` แทนที่จะไปเรียก node binary ใน path ที่เรา config ไว้ตอนแรก

ซึ่งความพิเศษของ volta คือ ความเร็วในการทำงาน และ ความสามารถในการ pin version ลงในโปรเจคของเราได้ ด้วยความเร็วจากภาษา Rust การ detect version ที่ต้องการใช้งาน และการสลับ version ที่เราต้องการใช้งาน มันรวดเร็วและเป็นธรรมชาติมากๆ

### การใช้งาน volta

ก่อนอื่นเลยก็ติดตั้งก่อน

```bash
curl https://get.volta.sh | bash
```

เสร็จแล้วเราจะเรียก `volta` ผ่าน shell ได้ละ

ไปที่ Project ที่เราต้องการ

```bash
cd projekt/red

volta pin node@12
```

สิ่งที่เกิดขึ้น volta จะทำการ install node version 12 (ถ้ายังไม่เคยลง) และ pin (ปัก) เวอร์ชั่นลงใน package.json หน้าตาประมานนี้

```json
{
  // ... package.json config
  "volta": {
    "node": "12.22.6"
  }
}
```

ทุกครั้งที่เราเข้ามาทำงานที่ project นี้ คำสั่ง node ของเราจะเป็น node version 12 โดยอัตโนมัติ โดย volta มันไปอ่านเจอ config แบบข้างบน เลยรู้ว่า โปรเจคนี้ต้องการ node 12 นะ มันก็จะวิ่งไปที่ node@12 ที่ติดตั้งเอาไว้ตอนสั่ง `volta pin` นั่นเอง และเมื่อเราออกไปที่อื่น volta ก็จะไปใช้ node version ของ global แทน (e.g. node@18)

### สามารถ pin npm หรือ yarn version ได้ด้วย

```bash
volta pin npm@7
# or
volta pin yarn@1
```

## สรุป

- volta.sh เป็น rust-based JavaScript command-line tools เด่นในเรื่องของความเร็วและความ seamless ในการใช้งาน
- สลับ version ตามแต่ละ project ได้โดยอัตโนมัติ ด้วยการ pin version ลงในโปรเจค ทำให้เราสามารถสลับ version ได้โดยไม่ต้องเขียน script หรือเปลี่ยน version ด้วยตัวเอง
- รองรับ package manager ได้หลากหลาย ทั้ง npm, yarn, หรือ pnpm
- สามารถใช้งานได้ทั้งบน macOS, Linux, และ Windows

เป็นยังไงกันบ้าง คิดว่า volta น่าจะตอบโจทย์ Node.js developers ส่วนใหญ่ในการ manage หลายๆ project ที่มีความต่างของ node version หรือ package manager ด้วยความสะดวกและประสิทธิภาพของ volta น่าจะช่วยแก้ไขปัญหาเหล่านี้ได้ดีเลยล่ะ

ขอให้สนุกกับการเขียนโค้ดครับ

Happy Hacking and Happy Thai Mother's Day 🎉
