---
title: guregu/null เวอร์ชั่นใหม่หลังจากไม่มีการเคลื่อนไหวกว่า 4 ปี
date: 2024-02-12T08:42:40.032Z
draft: false
tags:
  - golang
  - guregu
  - guregu/null
lastmod: 2024-02-12T08:42:42.656Z
preview: ../../../golang.png
keywords:
  - golang library
slug: guregu-null-v5-ปล่อยแล้ว
description: หลังจากไม่มีการเคลื่อนไหวกว่า 4 ปี ล่าสุด Guregu maintainer ของ package ชื่อดังอย่าง null ได้ merge และ release โค้ดเวอร์ชั่น 5 ที่ซัพพอร์ต Type Parameter แล้ว
---

Go developers น่าจะต้องเคยผ่านตา Package ที่ช่วยให้เราทำงานกับ nullable value อย่าง [guregu/null](https://github.com/guregu/null) กันมาบ้าง หลังจากที่ออก v4 มาเมื่อ 4 ปีที่แล้ว และใน github ก็ไม่มีการเคลื่อนไหวหรืออัพเดทอะไร ล่าสุดได้มีการ merge branch v5-dev เข้า master และทำการ release v5 ให้เราอัพเดทและนำไปใช้งานกันแล้ว

## Release Note

สิ่งที่เพิ่มมาใน version 5 หลักๆคือการรองรับ type parameter หรือ Generics ที่มีมาตั้งแต่ go1.18 ผ่านการใช้งาน `Value[T]` (ที่ห่อ `sql.Null[T]` อีกที) นอกจากนี้ตัว Package ยังเปลี่ยนเป็น Go Module แล้ว จากที่ v4 นั้นยังไม่ได้ใช้ Go Module เพื่อรองรับ backward compatibility แปลว่าหากจะใช้งาน `guregu/null` เวอร์ชั่นใหม่นี้ จะต้องใช้งานผ่าน module นะจ๊ะ

เรื่องเศร้าก็คือ หากใครอยากใช้งาน `v5` นี้จะต้องอัพเกรด `go version` ให้เป็น 1.22 นะครับ หากเวอร์ชั่นต่ำกว่านี้จะใช้งานไม่ได้นะ

> อ่าน [release note เพิ่มเติม](https://github.com/guregu/null/releases/tag/v5.0.0)

## ตัวอย่างการใช้งาน

เอาจริงๆ ถึงจะบอกว่า support generics แล้วแต่ก็ยังนึก use cases ไม่ค่อยออกเท่าไหร่นะ อาจจะเป็นเพราะช่วงนี้ผมสลับไปเขียน React + TypeScript เยอะมากๆ แทบไม่ได้เขียน Go เลย สมองอาจจะทื่อๆ ไปบ้าง แต่เดี๋ยวเรามาลองสร้าง demo เล่นๆ กันดูว่าจะเอา `null/v5` ที่รองรับ generics แล้วไปทำอะไรเจ๋งๆ ได้บ้าง

### ต้องการทำ nullable custom type

ที่เราคิดได้ไวไว เนื่องจาก `null/v5` มีของใหม่ให้ใช้คือ `null.Value[T]` แปลว่าเราสามารถส่ง custom type เข้าไปเพื่อควบคุมการทำงานบางอย่างเช่นตอน marshal/unmarshal json ดังตัวอย่าง

```go
type AwesomeInt64 int64

func (a AwesomeInt64) MarshalJSON() ([]byte, error) {
	a += 10000
	return json.Marshal(int64(a))
}

type Account struct {
	Balance null.Value[AwesomeInt64] `json:"balance"`
}

func main() {
	user := User{
		Balance: null.NewValue[AwesomeInt64](1234, true),
	}

	jsonBytes, err := json.Marshal(user)
}

// output Here is a thing {"balance":11234}
```

### ใช้สำหรับกำหนด nullable field ที่เป็น struct

นอกจาก custom primitive types แล้ว บาง field ที่เป็น struct มันก็ null ได้ เช่น

```go
// before
type User struct {
  Name    string    `json:"name"`
  Account *Account  `json:"account"`
}

// after
type User struct {
  Name    string              `json:"name"`
  Account null.Value[Account] `json:"account"`
}
```

จากที่เมื่อก่อนต้องคอยระวังการ access nil pointer กันวุ่นวาย ท่านี้ก็น่าจะทำให้ชีวิตง่ายขึ้นเยอะอยู่แฮะ

## สรุป

หายไปนานแต่ก็ยังกลับมาสร้างคุณประโยชน์ให้กับชุมชนนักพัฒนา ขอแสดงความนับถือใจคุณ [guregu](https://github.com/guregu) จริงๆ หากใครที่ใช้งาน package `null` อยู่ก็อย่าลืมสนับสนุนนักพัฒนาด้วยการกด star ใน github ของเค้ากันด้วยนะครับ

ขอให้มีความสุขกับการเขียนโค้ด และสวัสดีปีใหม่จีนครับ
