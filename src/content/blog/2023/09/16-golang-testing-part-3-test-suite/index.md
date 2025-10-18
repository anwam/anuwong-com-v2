---
title: Go Testing Part 3 - จัดระเบียบ Test Case ด้วย testify/suite
description: Project ขนาดใหญ่มักจะมีจำนวน domain ที่เยอะตาม การเขียน unit test ให้ครอบคลุมการทำงานของแต่ละ domain จึงต้องมีการจัดการ test case ที่ดี
date: 2023-09-16T13:32:10.824Z
preview: ./golang.png
draft: false
tags:
  - golang
  - testing
lastmod: 2023-09-16T13:32:10.824Z
---

Project ขนาดใหญ่มักจะมีจำนวน domain ที่เยอะตาม การเขียน unit test ให้ครอบคลุมการทำงานของแต่ละ domain จึงต้องมีการจัดการ test case ที่ดี

วันนี้มารู้จัก testify/suite เป็นเครื่องมือที่ช่วยจัดแบ่งหมวดหมู่ของ test case ตามแต่ละ domain หรือ component ให้เป็นระเบียบ สามารถจัดการ lifecycle ของ test case ให้สะดวกและง่ายดายยิ่งขึ้นครับ

## ติดตั้ง

```sh
go get github.com/stretchr/testify
```

## การใช้งาน

เริ่มจากการสร้าง test suite ขึ้นมาก่อนครับ โดยใน test suite จะเป็นโครงสร้างข้อมูลที่เราจะใช้สำหรับเก็บ components ที่จำเป็นสำหรับการทดสอบ เช่น mocked services, database connection หรือ http client ที่จำเป็นในการทดสอบครับ

```go
package main

import (
  "testing"

  "github.com/stretchr/testify/suite"
)

type MySuite struct {
  suite.Suite
  // สามารถเพิ่ม components ที่จำเป็นสำหรับการทดสอบได้ตรงนี้
}

func TestMySuite(t *testing.T) {
  suite.Run(t, new(MySuite))
}
```

โดยการฝัง `suite.Suite` เข้าไปใน struct MySuite จะทำให้ MySuite สามารถเรียกใช้ method ของ testify/suite ได้ครับ

เราสามารถเพิ่ม test case ลงไปใน MySuite ได้ดังนี้

```go
import (
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/suite"
)

func (s *MySuite) TestSomething() {
  result := user.DoSomething()
  assert.Equal(s.T(), "something", result)
}
```

## Lifecycle

เราสามารถใช้ method ของ testify/suite ในการจัดการ lifecycle ของ test case ได้

โดยทั่วไปแล้วเราจะใช้สำหรับ setup และ teardown state ของแต่ละ test case เพื่อไม่ให้มีผลกระทบกันระหว่างแต่ละ test case ครับ
เช่น test ที่ 1 ได้ทำการ mock http response ไว้ state ของการ mock จะต้องถูกเคลียร์ก่อนที่ test ถัดไปจะถูกรัน เพื่อให้การทำงานของ test case ถัดไปทำงานไดถูกต้อง

มาดูตัวอย่างการเขียน lifecycle กันครับ

```go
func (s *MySuite) SetupSuite() {
  // Setup before all tests
}

func (s *MySuite) TearDownSuite() {
  // Tear down after all tests
}

func (s *MySuite) SetupTest() {
  // Setup before each test
}

func (s *MySuite) TearDownTest() {
  // Tear down after each test
}
```

## ตัวอย่าง

เรามาลองสร้าง test suite สำหรับการบวกเลขกันดูครับ

```go
package main

import (
  "testing"

  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/suite"
)

type CalculatorSuite struct {
  suite.Suite
  calculator *Calculator
}

func (s *CalculatorSuite) SetupTest() {
  // สร้าง instance ของ Calculator ขึ้นมาใหม่ทุกครั้งก่อนที่จะเริ่มทดสอบ
  // เพื่อ ให้ test case แต่ละตัวไม่มีผลกระทบกัน
  s.calculator = NewCalculator()
}

func (s *CalculatorSuite) TestAdd() {
  // method ที่ขึ้นต้นด้วยคำว่า Test จะถูกเรียกใช้เป็น test case
  assert.Equal(s.T(), 3, s.calculator.Add(1, 2))
}

func (s *CalculatorSuite) TestSubtract() {
  assert.Equal(s.T(), 1, s.calculator.Subtract(3, 2))
}

func TestCalculatorSuite(t *testing.T) {
  suite.Run(t, new(CalculatorSuite))
}
```

เสร็จแล้วววว ไม่ยากใช่มั้ย? เพียงเท่านี้ unit test ของเราก็จะเป็นระเบียบ มัดรวมกันเป็นก้อนๆ เพื่อให้การทดสอบระบบที่มีความซับซ้อนเป็นไปอย่างง่ายดายและสะดวกยิ่งขึ้น

## สรุป

- testify/suite เป็นเครื่องมือที่ช่วยจัดการ test case ให้เป็นระเบียบ
- เราสามารถจัดการ lifecycle ของ test case ได้ด้วย
- การใช้ testify/suite จะทำให้การทดสอบระบบที่มีความซับซ้อนเป็นไปอย่างง่ายดายและสะดวกยิ่งขึ้น

Happy coding!
