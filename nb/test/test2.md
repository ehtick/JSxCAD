![Image](test2.md.$1.png)

```JavaScript
Box(4, 4, 4)
  .cut(
    eachEdge()
      .sort('z>y<x>')
      .n(0, 1)
      .op((e) => Box(2, 2, [0, 4]).to(e))
  )
  .view();
```