![Image](honeycomb.md.$1.png)

```JavaScript
await Hexagon(4)
  .seq(
    { upto: 10 },
    { upto: 10 },
    (x, y) => (s) => s.move(x * 5 + (y % 2) * 2.5, y * 4),
    Group
  )
  .align('xy')
  .ez([10])
  .clip(Arc(45).ez([10]))
  .view();
```
