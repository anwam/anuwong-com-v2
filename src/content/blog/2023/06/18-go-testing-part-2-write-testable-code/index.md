---
title: Go Testing Part 2 - Write Testable Code
subtitle: เขียนโค้ดให้เทสง่าย แล้วชีวิตจะดีนะเออ
description: การเขียนโค้ดที่สามารถทดสอบได้ (Testable Code) เป็นอีกหนึ่งปัจจัยใจ ที่สามารถแบ่งระดับความชำนาญ/ความเชี่ยวชาญของนักพัฒนาได้ เพราะการมีชุดทดสอบที่ดี เชื่อถือได้ จะทำให้การพัฒนา Software เป็นไปได้อย่างราบรื่น
date: 2023-06-18T12:27:46.405Z
preview: ./golang.png
draft: false
tags:
  - golang
  - testing
categories: ""
lastmod: 2023-08-21T02:06:10.073Z
---

การเขียนโค้ดที่สามารถทดสอบได้ (Testable Code) เป็นอีกหนึ่งปัจจัยใจ ที่สามารถแบ่งระดับความชำนาญ/ความเชี่ยวชาญของนักพัฒนาได้ เพราะการมีชุดทดสอบที่ดี เชื่อถือได้ จะทำให้การพัฒนา Software เป็นไปได้อย่างราบรื่น

สำหรับนักพัฒนาที่ทำงานมาได้สักระยะจะรู้กันดี ว่าการที่ระบบของเรามีชุดทดสอบที่พึ่งพาได้ จะช่วยให้เราทำงานได้มีความสุขแค่ไหน นอกเหนือจากเหตุผลด้าน KPI ของทีม การมีชุดทดสอบที่ดี จะทำให้นักพัฒนาในทีมทำงานได้อย่างมีประสิทธิภาพ แก้โค้ดได้อย่างมั่นใจ

## Dependency Injection

ในภาษา Go มีหนึ่งรูปแบบการเขียนโค้ดให้เหมาะกับการทดสอบ โดยอาศัยหลักการ Dependency Injection (DI) และความสามารถของ `interface` มาช่วยในการทำให้โค้ดเป็น Testable Code ได้

> Dependency Injection เป็นหลักการที่เราจะส่ง dependency เข้าไปใน function หรือ method แทนที่จะสร้าง dependency ใน function หรือ method นั้นๆ ขึ้นมาเอง ซึ่งจะช่วยเพิ่มความยืดหยุ่นของการทำงาน โดยที่เราสามารถเปลี่ยน dependency ได้ตามต้องการ โดยไม่ต้องแก้โค้ดที่เราเขียนไปแล้ว ขอแค่มี interface ที่เป็นตัวกลางในการรับ dependency ที่เราต้องการ

มาดูตัวอย่าง Code ที่ใช้ `interface` ช่วยในการทำ Dependency Injection กัน

```go
package main

// UserWriter เป็น interface แปลว่าสามารถใช้ type ใดใดก็ตาม ที่มีการ implement method Write(user User) error ทดแทนกันได้
type UserWriter interface {
    Write(user User) error // interface นี้มี method write ที่รับ user เป็น parameter และ return error
}

type UserHandler struct {
    userWriter UserWriter // dependency ของเรา สร้าง field ชื่อ userWriter เป็น type UserWriter ที่เป็น interface
}

func (u *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    // do stuff before writing
    u.userWriter.Write(user) // เรียกใช้ method Write ผ่าน userWriter
    // ...
}

type UserWriterImpl struct {
    db *sql.DB
}

func (u *UserWriterImpl) Write(user User) error {
    // ทำการ implement method Write ที่รับ user เป็น parameter และ return error
    return nil
}

// จากนี้ไป UserWriterImpl จะสามาถใช้แทน UserWriter ได้แล้ว เพราะมี method Write อยู่

func main() {
    db, err := getSomeDB()
    if err != nil {
        log.Fatal(err)
    }

    userWriter := &UserWriterImpl{db: db}
    userHandler := &UserHandler{userWriter: userWriter} // <- inject userWriter เข้าไปใน userHandler
    http.HandleFunc("/users", userHandler.CreateUser)
}
```

จะเห็นว่า `UserHandler` นั้นมีสมาชิก 1 ตัวคือ `userWriter` type `UserWriter` ซึ่งเป็น interface ที่มี method `Write`

จากนั้น มีการสร้าง type `UserWriterImpl` เป็น struct ที่มีการ implement method `Write` ทำให้ตอนนี้ เราสามารถส่ง UserWriterImpl เข้าไปใน UserHandler ได้ จะสามารถเรียกใช้ method `Write` ผ่าน `userWriter` ได้ละ

มาถึงตรงนี้ แปลว่า เราสามารถที่จะประกาศ type อะไรก็ตามที่มี method `Write` เพื่อที่จะส่ง type นั้นเข้าไปใน `UserHandler` ได้ ซึ่งเราสามารถใช้ได้กับการทดสอบได้เลย

```go
package main

type MockUserWriter struct {
    isCall bool
}

func (m *MockUserWriter) Write(user User) error {
    m.isCall = true
    return nil
}

func Test_CreateUser(t *testing.T) {
    mockUserWriter := &MockUserWriter{}
    userHandler := &UserHandler{userWriter: mockUserWriter}

    userHandler.CreateUser(nil, nil)

    if !mockUserWriter.isCall {
        t.Error("expect to call Write method")
    }
}
```

## Mock Tool

หลักจากเราลองเขียน mock type ขึ้นมาเองแล้ว อาจจะดูลำบากหน่อยถ้ามี interface จำนวนมากที่เราต้องเขียน mock type ขึ้นมาเอง เรามาดูตัวช่วยกันดีกว่า นั่นก็คือ `mockery` ซึ่งเป็น tool ที่ช่วย generate mock type ให้เราอ้างอิงจาก interface ที่เราสนใจ

> อ่านรายละเอียดเพิ่มเติม <https://github.com/vektra/mockery>

```bash
go install github.com/vektra/mockery@latest

mockery --name UserWriter --with-expecter --inpackage
```

แล้วเราก็จะได้ไฟล์ `mock_UserWriter.go` ที่มีการ mock type UserWriter ให้เราเรียบร้อย พร้อมกับ implementation ต่างๆที่เป็นประโยชน์ในการทดสอบ

```go
package main

import (
    "testing"
)

func Test_CreateUser(t *testing.T) {
    mockUserWriter := NewMockUserWriter(t)
    userHandler := &UserHandler{userWriter: mockUserWriter}

    mockUserWriter.EXPECT().Write(User{Name: "John"}) // เราสามารถ expect ได้ว่า Write จะถูกเรียกด้วย User ที่มี Name เป็น John

    userHandler.CreateUser(nil, nil)
}
```

เครื่องมือที่เราใช้ในการช่วยทำ Mock Dependency ก็จะมีประมานนี้ หากเราออกแบบโปรแกรมให้สามารถเทสได้ง่ายตั้งแต่แรก การเขียน unit test ก็จะไม่ใช่เรื่องน่าปวดหัวอีกต่อไป

## Summary

- การเขียนโค้ดให้ทดสอบได้ง่าย ช่วยให้การพัฒนาซอฟต์แวร์เป็นไปอย่างราบรื่น และเป็นประโยชน์ต่อทีม
- การใช้ Design Patterns จะช่วยให้เราสามารถออกแบบ Abstraction ของระบบได้ง่ายและมีหลักการมากขึ้น
- Dependency Injection เป็น Design Patterns ที่ช่วยให้เราสามารถเขียนโปรแกรมที่ทดสอบได้ง่าย มีความยืดหยุ่น ลดการผูกมัดของ (Decoupling) ระหว่างโมดูล และเป็นประโยชน์ต่อการทำงานของทีม
- การทำ Unit Testing บางครั้งต้องอาศัยการ Mock ซึ่งการเลือกใช้ Tools ที่ตรงกับงานที่เราทำ จะช่วยให้ทำงานได้ง่ายขึ้น

ขอให้สนุกกับการเขียนโค้ดครับ
