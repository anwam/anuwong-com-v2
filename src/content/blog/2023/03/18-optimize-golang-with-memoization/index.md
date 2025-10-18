---
title: เพิ่มประสิทธิภาพโปรแกรมภาษา Go ด้วยเทคนิก Memoization
description: Memoization เป็นเทคนิกในการเพิ่มประสิทธิภาพสำหรับโปรแกรมที่มี cost ในการคำนวนสูงๆ โดยการเก็บผลลัพธ์ไว้และคืนกลับไปหากได้รับ input parameters เดิม ซึ่งจะช่วยลด expensive calculation ไปได้มหาศาล
date: 2023-03-18T08:35:51.589Z
preview: ./golang.png
draft: false
tags:
  - golang
  - optimization
  - web
categories: null
lastmod: 2023-08-21T02:05:55.634Z
---

Memoization เป็นเทคนิกในการเพิ่มประสิทธิภาพสำหรับโปรแกรมที่มี cost ในการคำนวนสูงๆ โดยการเก็บผลลัพธ์ที่เคยคำนวนไว้ และคืนกลับไปหากได้รับ input parameters เดิม ซึ่งจะช่วยลด expensive calculation ไปได้มหาศาล

ในการเขียนโปรแกรม บางครั้งเราต้องเขียนโปรแกรมเพื่อคำนวนอะไรบางอย่างที่มีการคำนวนหนักๆ และใช้พลังงานเครื่องเยอะ เช่น ฟังก์ชั่นคำนวนเลข Fibonacci, การคำนวน Factorial เป็นต้น ซึ่งฟังก์ชั่นพวกนี้มักจะมีการวนการทำงาน หรือบางครั้งถูกเขียนอยู่ในรูปของ Recursive Function แน่นอนว่าต้องใช้ทรัพยากรสูงขึ้นเรื่อยๆ ตามจำนวน function calls หรือรอบของการทำงาน

ตัวอย่างโปรแกรมคำนวน Fibonacci

```go
package main

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}


func main() {
    result := fibonacci(20)
    fmt.Println(result) // the result is 6765
}
```

จากโปรแกรมดังกล่าว จะเห็นว่ามีการใช้เทคนิกการเขียนโปรแกรมอย่าง Recursive Function หรือก็คือการที่ฟังก์ชั่นนั้น เรียกฟังก์ชั่นตัวเองเพืื่อวนรอบการทำงาน ซึ่งหากค่าเริ่มต้นของโปรแกรมมีสูง Call stacks ก็จะยิ่งสูงมาขึ้น สิ้นเปลือง CPU, I/O หรือ Memory เป็นอย่างมาก

เรามาดูคะแนน Benchmark กัน ทดสอบด้วยชุดคำสั่งง่ายๆ

```go
package main
import "testing"

func BenchmarkFibonacci(b *testing.B) {
    for i := 0; i < b.N; i++ {
        fibonacci(20)
    }
}
```

ผลการทดสอบ

```txt
goos: darwin
goarch: arm64
pkg: lab/go-fibonacci
=== RUN   BenchmarkFibonacci
BenchmarkFibonacci
BenchmarkFibonacci-8       47425             22578 ns/op               0 B/op          0 allocs/op
PASS
ok      lab/go-fibonacci        2.504s
```

ที่นี้ลองดูมาปรับฟังก์ชั่น Fibonacci ให้เป็นแบบ memoization กันดู ได้หน้าตาแบบนี้

```go
func fibonacciMemo(n int, memo map[int]int) int {
    if n <= 1 {
        return n
    }
    if val, ok := memo[n]; ok {
        return val
    }
    memo[n] = fibonacciMemo(n-1, memo) + fibonacciMemo(n-2, memo)
    return memo[n]
}

func main() {
    memo := make(map[int]int)
    result := fibonacciMemo(20, memo)
    fmt.Println(result)
}
```

สิ่งที่เพิ่มขึ้นมาก็คือ `map[int]int` สำหรับเก็บผลลัพธ์ของการคำนวน fibonacci `n` หากมีผลลัพธ์อยู่แล้ว ก็คืนค่าออกไปเลยไม่ต้องคำนวนใหม่ เทคนิก memoization จะช่วยทำให้ไม่ต้องคำนวน fibonacci ของ `n` ซ้ำใหม่ทุกครั้ง โดยเก็บผลลัพธ์ที่เคยคำนวนไว้ใน memory นั่นเอง

มาดูผล benchmark กัน

```txt
goos: darwin
goarch: arm64
pkg: lab/go-fibonacci
=== RUN   BenchmarkFibonacciOptimized
BenchmarkFibonacciOptimized
BenchmarkFibonacciOptimized-8            1319659               882.5 ns/op           932 B/op          3 allocs/op
PASS
ok      lab/go-fibonacci        3.070s
```

ผลลัพธ์ค่อนข้างน่าสนใจ โดยหากดูจาก execution time ที่ลดลงจาก 22578 ns/op เหลือเพียง 880 ns/op ก็ถือว่าทำเวลาลดลงมาได้ถึง 25 เท่า! แต่ก็จะมี trade-off ตรงที่มีการ allocation เพิ่มเติมขึ้นมา เพื่อทำการเก็บผลลัพธ์ไว้ใช้ซ้ำแหละ

ก่อนจากกัน เทคนิกการเขียนโปรแกรมแบบต่างๆ มันมีจุดประสงค์ของมัน บ้างเพื่อเพิ่มความเร็ว บ้างก็เพื่อลดการใช้ทรัพยากร ทั้งนี้ทั้งนั้น Developer ก็ควรจะต้องรู้จุดประสงค์ของสิ่งที่ตัวเองกำลังทำหรือต้องการจะทำ เข้าใจว่าทำไปทำไม ทำไปแล้วได้อะไร หรือ ตัดสินใจได้ว่าจะไม่ทำ เพราะอะไร

ขอให้มีความสุขกับการเขียนโปรแกรมครับ
