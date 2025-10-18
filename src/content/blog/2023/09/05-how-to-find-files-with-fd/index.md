---
title: หาไฟล์และโฟลเดอร์แบบโคตรแรงด้วย fd ⚡️
description: ปกติใช้ find cli ในการหาไฟล์ในเครื่องตาม pattern ต่างๆ วันนี้มาแนะนำให้รู้จัก fd ที่เป็น find alternative ที่เขียนด้วย rust ครับ
date: 2023-09-05T11:22:03.990Z
draft: false
tags:
  - fd
  - find
  - rust
  - cli
categories:
  - fd
  - find
  - rust
  - cli
lastmod: 2023-09-05T11:21:33.402Z
preview: ./screenshots-1.png
---

ปกติใช้ find cli ในการหาไฟล์ในเครื่องตาม pattern ต่างๆ วันนี้มาแนะนำให้รู้จัก fd ที่เป็น find alternative ที่เขียนด้วย rust ครับ

สิ่งที่ใช้งาน find หลักๆ ก็จะเป็นพวก หาไฟล์ jpeg ทั้งหมดใน directory นี้

```bash
find . -name "*.jpeg"
```

หา directory **node_modules** ทั้งหมดใน directory นี้

```bash
find . -name "node_modules"
```

หรือจะเป็นการหาไฟล์ที่มีข้อความ **"hello world"** ในไฟล์

```bash
find . -type f -exec grep -l "hello world" {} \;
```

แต่วันนี้ผมจะมาป้ายยา [fd](https://github.com/sharkdp/fd) เป็น find alternatives ที่โคตรเร็ว เพราะเขียนด้วยภาษา rust ครับ

## ติดตั้ง

### Ubuntu

```bash
sudo apt install fd-find
```

### Debian

```bash
sudo apt-get install fd-find
```

### Fedora

```bash
dnf install fd-find
```

### MacOS

```bash
brew install fd
```

## ลองใช้งานในการค้นหาไฟล์ต่างๆ

```bash
fd node_modules
```

แต่ถ้ากลัวว่าจะมี file ชื่อ node_modules จะเอาเฉพาะ directory ก็เพิ่ม -t d ไปด้วย

```bash
fd -t d node_modules
```

-t ก็คือ type ส่วน d ก็คือ directory ครับ

แต่ถ้าเราไปหา node_modules ใน directory ที่มี .gitignore มันอาจจะหาไม่เจอนะ เพราะ fd จะ ignore ไฟล์ .gitignore อัตโนมัติ และส่วนใหญ่ .gitignore เราจะ ignore node_modules กันอยู่แล้ว ถ้าเราต้องการให้หาทุกไฟล์ก็ใส่ -I ไปด้วย

```bash
fd -t d -I node_modules
```

-I หมายถึง no ignore ก็คือไม่สนใจ .gitignore นั่นเอง

หรือจะหาไฟล์ด้วย regexp pattern ก็ได้นะ! เช่น ต้องการไฟล์ .docx ที่มีตัวเลขอยู่ในชื่อไฟล์

```bash
fd -e docx '.*[0-9]\.docx$'
```

จริงๆ features หลักๆนั้นก็ทำได้เหมือน find นั่นแหละ แต่ส่วนที่ต่างกันคือความเร็ว! เพราะ fd นั้นสามารถหาของได้เร็วกว่ามากๆ [ดูผล benchmark เทียบกับ find ได้เลย](https://github.com/sharkdp/fd#benchmark)

### find benchmark

```sh
Benchmark #1: find ~ -iregex '.*[0-9]\.jpg$'

Time (mean ± σ):      7.236 s ±  0.090 s

Range (min … max):    7.133 s …  7.385 s
```

### fd benchmark

```sh
Benchmark #3: fd -HI '.*[0-9]\.jpg$' ~

Time (mean ± σ):     811.6 ms ±  26.9 ms

Range (min … max):   786.0 ms … 870.7 ms
```

จะเห็นกว่า fd มันแรงกว่ามากกกกกก

สาเหตุที่เร็วได้ขนาดนี้เค้าบอกว่าเป็นเพราะใช้เทคนิกชื่อ `parallelized directory traversal` ก็ลองไปหาเพิ่มเติมกันครับว่ามันคืออะไร (ฮ่าาๆ)

ก็จบไปแล้วบทความนี้ มาแบบสั้นๆ ละกันเพราะช่วงนี้งานยุ่งนิดหน่อย จริงๆ การใช้งานทั้ง find หรือ fd นั้นมีมากกว่านี้ เช่น หาไฟล์รูป jpeg ทั้งหมดใน dir และ sub dir (recursive) แล้วส่งไป resize and compress ด้วย optimizt หรือ imagemagick ก็ทำได้ครับ

```bash
fd -e jpeg -x optimizt {}
```

หรืออีกอย่างที่ผมใช้บ่อยสุดๆ ก็คือหา node_modules ทั้งหมดใน workspace แล้วลบทิ้ง เพราะมันหนักโว้ย!

```bash
fd -t d node_modules -x rm -rf {}
```

## สรุป

- ใช้ fd แทน find ได้เลย แต่มีปรับ options ต่างๆ นิดหน่อย
- fd หาไฟล์และโฟลเดอร์ได้เร็วกว่า find มากๆ
- เร็ว!

ขอให้สนุกกับการเขียนโค้ดครับ
