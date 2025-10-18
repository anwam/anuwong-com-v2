---
title: k6 - ระบบเรารองรับผู้ใช้ได้มากแค่ไหน load test ดูเดี๋ยวก็รู้
description: สำหรับ Backend Developer การรู้ limit ของระบบที่ตัวเองทำเป็นเรื่องสำคัญมาก เพราะการวางแผนการ scaling เป็นส่วนหนึ่งของงาน วันนี้มาใช้ k6 ทำ load test เพื่อดูว่าระบบของเรารับโหลดให้มากแค่ไหนกัน
date: 2023-09-16T14:03:43.080Z
draft: true
tags:
  - testing
  - performance
lastmod: 2023-09-08T13:04:18.847Z
preview: ../../../k6.svg
---

สำหรับ Backend Developer การรู้ limit ของระบบที่ตัวเองทำเป็นเรื่องสำคัญมาก เพราะการวางแผนการ scaling เป็นส่วนหนึ่งของงาน วันนี้มาใช้ [k6](https://k6.io/) ทำ load test เพื่อดูว่าระบบของเรารับโหลดให้มากแค่ไหนกัน

> Simple testing is better than no testing

ก่อนจะเริ่มการทดสอบ ให้ตั้งเป้าหมายก่อนเสมอ เช่น

- อยากรู้ว่าระบบรับ load ได้ถึงกี่ tps สำหรับ x concurrent จนกว่าจะเริ่มมี error ที่ไม่เกิน x %
- ระบบสามารถรับ spike load ภายในเวลา x วินาทีได้หรือไม่
- ถ้ามี x,xxx tps เข้ามา ระบบสามารถรับได้นานกี่นาทีจนกว่า resources จะหมด
- ถ้ามี x concurrent user ระบบสามารถตอบได้ภายในเวลา x มิลลิวินาทีได้หรือไม่

แน่นอน ระบบที่เป็นมาตรฐานเราจะต้องมีการการันตี SLAs ให้กับผู้ใช้งาน (ในกรณีที่เป็น platform) และการกำหนด goal ของการทดสอบก็ควรจะยึดโยงกับเอกสารที่ได้ทำ commitment ไว้กับผู้ใช้งานด้วย

> Load testing should be goal-oriented

## ติดตั้ง k6

[อ่านเพิ่มเติมได้ที่นี่](https://k6.io/docs/get-started/installation/)

### Linux

#### Debian/Ubuntu

```sh
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### Fedora/CentOS

```sh
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

### MacOS

```sh
brew install k6
```

### Windows

```sh
choco install k6
```

```sh
winget install k6 --source winget
```
