---
title: จัดการ dotfiles ด้วย chezmoi
description: เครื่องมือสำหรับจัดการ Configuration Files ต่างๆ บนคอมที่เราใช้ทำงาน เช่น .zshrc, .bashrc อยาก Backup และ Share ระหว่างคอมหลายเครื่อง มาใช้ Chezmoi กัน
date: 2024-05-01T08:27:48.827Z
draft: false
tags:
  - dotfiles
lastmod: 2024-05-01T08:27:50.329Z
preview: ./chezmoi.webp
---

Developers ที่ใช้ macOS หรือ Linux distro แน่นอนว่าจะต้องมี Configuration files ที่ชื่อนำหน้าด้วย `.` กันแน่นอน ไม่ว่าจะเป็น `.zshrc` `.bashrc` `.vimrc` `.gitconfig` ซึ่งเป็นไฟล์ที่ application ต่างๆ สร้างขึ้นเพื่อเก็บ settings, configuration เอาไว้ ให้เราทำงานได้สะดวก หรือปรับแต่งการทำงานของให้เหมาะกับ workflow ของเรา

> [What is dotflies](https://www.freecodecamp.org/news/dotfiles-what-is-a-dot-file-and-how-to-create-it-in-mac-and-linux/)

ปัญหาที่หลายๆ คนน่าจะเคยเจอ โดยเฉพาะคนที่มีทั้งคอมส่วนตัว คอมของออฟฟิศ แต่ก้ยังอยากให้มี setup เหมือนกัน ช่วงแรกที่ยังไม่มี config อะไรเยอะก็ไม่เจอปัญหา แต่พอเราย้ายงานหรือเปลี่ยนคอมส่วนตัวอยาก ก็ต้องมาไล่แก้ config dotfiles ต่างๆ ใหม่ วุ่นวาย แถม productivity ยังต่ำอีกต่างหาก

## Chezmoi

[chezmoi](https://www.chezmoi.io/) เป็น Opensource cross-platform dotfiles manager ที่สามารถใช้งานได้บนทุก platform ทั้ง macOS, Linux, Windows โดยมีฟีเจอร์ในการจัดการ dotfiles อย่างครบครัน ทั้งการทำ version control, การ Backup dotfiles ด้วย git, การเทียบ remote version vs local version และอื่นๆ อีกมากมายที่จะช่วยให้การทำงานกับคอมหลายๆ เครื่องเป็นไปอย่างราบรื่น

### Installation

[วิธีติดตั้ง chezmoi](https://www.chezmoi.io/install/)

```sh
# macOS
brew install chezmoi
```

### Getting Started

หลังจากติดตั้ง `chezmoi` แล้ว เปิด `Terminal` แล้วสั่ง

```sh
chezmoi init
```

`chezmoi` จะไปสร้าง local git repository ที่ `~/.local/share/chezmoi` ซึ่งจะเป็นที่ที่ `chezmoi` ทำการเก็บ source state ของ dotfiles ที่เราต้องการบันทึกไว้

จากนั้นสั่ง

```sh
chezmoi add ~/.zshrc
```

`chezmoi` จะทำการก๊อปปี้ `~/.zshrc` ไปไว้ที่ `~/.local/share/chezmoi/dot_zshrc`

เมื่อเราต้องการแก้ไข file สามารถทำได้หลายวิธี แต่ที่ค่อนข้างง่ายและอยากแนะนำคือ ใช้ `chezmoi` command

```sh
chezmoi edit ~/.zshrc
```

ซึ่ง `chezmoi` จะทำการเปิดไฟล์ด้วย `$EDITOR` (default น่าจะเป็น `vim`) แก้ไขไฟล์แล้วทำการเซฟ จากนั้นลองดู diff ด้วยคำสั่ง

```sh
chezmoi diff
```

ตรวจสอบว่าแก้ไขถูกต้องหรือยัง จากนั้นทำการ apply change ไปที่ source file

```sh
chezmoi -v apply
```

> ทุก command ของ chezmoi สามารถรับ -v (verbose) ได้เพื่อบอกว่าโปรแกรมกำลังทำอะไรอยู่

เมื่อแก้ไขทุกอย่างเสร็จสิ้นตามที่ต้องการแล้ว เราจะทำการ backup dotfiles ของเราขึ้นไปไว้บน git กัน

ในบทความผู้เขียนใช้ GitHub เป็นบริการ git เป็นหลักนะครับ

```sh
chezmoi cd
git add .
git commit -m "initial commit"
```

แว่บไปสร้าง repo บน GitHub ก่อนนะครับ ผมจะตั้งชื่อ repo ว่า dotfiles ละกัน เห็นแล้วรู้ทันทีว่าเก้บอะไร

```sh
git remote add origin git@github.com:$GITHUB_USERNAME/dotfiles.git
git branch -M main
git push -u origin main
```

เท่านี้เราก็จะมีที่เก็บ dotfiles ให้พร้อมนำไปใช้กับเครื่องอื่นแล้วครับ

### Another Device

หากต้องการใช้ dotfiles ที่เราเตรียมไว้จากขั้นตอนข้างบนด้วย `chezmoi` บนเครื่องใหม่ เราสามารถรันคำสั่งเดียวได้เลย

```sh
chezmoi init --apply https://github.com/$GITHUB_USERNAME/dotfiles.git

# ถ้าใช้ GitHub สั่งสั้นๆ แบบนี้ได้เลย
chezmoi init --apply $GITHUB_USERNAME
```

ในกรณีที่เป็น Private repo ให้ใช้คำสั่งนี้แทน

```sh
chezmoi init --apply git@github.com:$GITHUB_USERNAME/dotfiles.git
```

> อย่าลืม add ssh key ให้เครื่องใหม่ก่อนด้วยนะครับ

เท่านี้เครื่องใหม่ของเราก็จะมี config ที่เหมือนกับเครื่องแรกทุกประการ

### Daily Operations

แนะนำคำสั่งที่จะใช้ในแต่ละวันสำหรับ update, sync dotfiles ของเรากันครับ

```sh
chezmoi update
```

จะเป็นการสั่ง `git pull` เพื่อเอา changes ล่าสุดบน remote ลงมาที่เครื่องเราแหละ

```sh
chezmoi apply
```

เป็นการ apply change จาก chezmoi source state ไปที่ source file

```sh
chezmoi cd
```

change directory ไปที่ `~/.local/share/chezmoi`

## Summary

- Chezmoi เป็นเครื่องมือที่ช่วยจัดการ dotfiles ในเครื่องคอมพิวเตอร์
- Chezmoi มีฟีเจอร์ที่ครอบคลุมทั้งการทำ version control, การ backup ด้วย git, และการเปรียบเทียบระหว่างเวอร์ชัน
- การติดตั้ง Chezmoi สามารถทำได้ง่ายๆ โดยใช้คำสั่ง `brew install chezmoi` สำหรับ macOS
- เริ่มต้นใช้งาน Chezmoi โดยใช้คำสั่ง `chezmoi init` เพื่อสร้าง local git repository และ `chezmoi add` เพื่อเพิ่ม dotfile
- การแก้ไข dotfile สามารถทำได้โดยใช้ `chezmoi edit` และตรวจสอบการเปลี่ยนแปลงด้วย `chezmoi diff`
- เมื่อแก้ไขเสร็จสิ้น สามารถทำการ apply change ได้โดยใช้ `chezmoi apply`
- เพื่อ backup dotfile บน git สามารถใช้คำสั่ง `chezmoi cd` เพื่อเข้าไปยัง local git repository และใช้คำสั่ง `git add .` `git commit` และ `git push` เพื่อส่งไปยัง remote repository บน GitHub
- เมื่อต้องการใช้ dotfile บนเครื่องใหม่ สามารถใช้คำสั่ง `chezmoi init --apply` เพื่อดึง dotfile จาก remote repository
- ในการใช้งานประจำวัน สามารถใช้คำสั่ง `chezmoi update` เพื่ออัพเดต dotfile และ `chezmoi apply` เพื่อนำเข้าการเปลี่ยนแปลง
