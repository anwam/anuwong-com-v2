---
title: Go Testing Part 1 - json.Unmarshal mock ยังไงอะ
description: เมื่อถึงขั้นตอนทำ Unit Testing จะเจอปัญหาว่า เออเราจะทำยังไงให้ json.Unmarshal มัน error ได้นะ
date: 2023-02-04T08:42:51.220Z
preview: ../golang.png
draft: false
tags:
  - golang
  - testing
lastmod: 2023-08-21T02:07:10.572Z
---

สำหรับการทำงานกับข้อมูลที่เป็น JSON ในภาษา Go แนวทางที่นิยมที่สุดก็คือการใช้ built-in package ที่ชื่อ `json` ในการ Encode / Decode ซึ่งโดยทั่วไปแล้วมักจะทำผ่านฟังก์ชั่น `json.Marshal` และ `json.Unmarshal` นั่นเอง

พอพัฒนาไปได้สักระยะ เมื่อถึงขั้นตอนทำ Unit Testing จะเจอปัญหาว่า เออเราจะทำยังไงให้ json.Unmarshal มัน error ได้นะ

หากโปรแกรมส่วนนั้นเราสามารถควบคุมข้อมูล []byte ที่จะถูกผ่านเข้าไปใน Unmarshal ได้ ก็ไม่น่าจะมีปัญหา แต่ในกรณีที่เราคุมไม่ได้ ทำอย่างไร

ตัวอย่าง

```go
  // client.go
  package client

  import (
    "json"
    "log"
  )

  func DoSomeWork() (*someType, error) {
    // do something great
    // then you got `dataBytes`
    v := new(someType)
    if err := json.Unmarshal(dataBytes, v); err != nil { // how to make this error?
      log.Printf("unmarshal json error : %s", err.Error())
      return nil, err
    }
    return v, nil
  }
```

จากโค้ดข้างต้น หากเราสามารถบังคับ dataBytes ให้ออกค่าที่เราต้องการ เราก็จะสามารถทำให้ json.Unmarshal มัน error ได้

แต่ถ้าเราทำไม่ได้ วิธีง่ายที่สุดคือ สร้างตัวแปรมารับฟังก์ชั่น json.Unmarshal ในระดับ package ลองดูตัวอย่าง

```go
  // client.go
  package client

  import (
    "json"
    "log"
  )

  var jsonUnmarshal = json.Unmarshal

  func DoSomeWork() (*someType, error) {
    // do something great
    // then you got `dataBytes`
    v := new(someType)
    // use our self-declared function instead from json package
    if err := jsonUnmarshal(dataBytes, v); err != nil {
      log.Printf("unmarshal json error : %s", err.Error())
      return nil, err
    }
    return v, nil
  }
```

จากนั้น เราก็จะสามารถ re-assign implementation ให้ฟังก์ชั่น jsonUnmarshal ได้ในตอน test แล้ว

```go
// client_test.go
package client
import (
  "errors"
)

func Test_DoSomeWork(t *testing.T) {
  // re-assign implementation
  jsonUnmarshal = func(bytes []byte, v interface{}) error {
    return errors.New("unmarshal error")
  }
  _, err := DoSomeWork() // ทำงานอะไรบางอย่างเสร็จ จะเออเร่อจากการ unmarshal
  assert.NotNil(t, err)
  assert.Equal(t, "unmarshal error", err.Error())

  // test เสร็จ อย่าลืม assign กลับ
  // เผื่อใน case ถัดไปมีการใช้งานที่ต้องทำงานปกติอยู่
  jsonUnmarshal = json.Unmarshal
}
```

เสร็จแล้วครับ ง่ายมั้ย จริงๆสามารถใช้กับ utility functions อื่นๆ ได้เช่น time.Now(), io.ReadAll ต่างๆ

ที่ถ้าอยากให้ code coverage 100% ที่ต้องไป cover ตรงส่วน error handling ด้วย ท่านี้ก็จะสะดวกขึ้นเยอะเลย

อันนี้ขอลงไว้เป็น Part แรกละกัน เพราะจริงๆ การ mock ของสำหรับ test ในภาษา Go มันทำได้หลายท่ามากๆ

อันนี้ถือเป็นท่าที่ simple ไปก่อนละกันเนอะ ไว้มีเวลาจะมาเขียนอัพเดทว่า จะเขียนแบบอื่นได้ยังไง
