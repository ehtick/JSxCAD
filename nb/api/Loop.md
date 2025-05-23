[index](../../nb/api/index.md)
### Loop(...shapes)
Parameter|Default|Type
---|---|---
|...shapes||Shapes to link into a closed polyline.

Constructs a polyline from the segments of the shape and provided shapes.

The shapes are linked by straight segments.

The polyline is closed.

See: [Link](../../nb/api/Link.md)

![Image](Loop.md.$2.png)

```JavaScript
Loop(
  Line(5).link('reverse'),
  Point(0, 8),
  Arc([4, 5], [4, 5], { start: 0 / 4, end: 3 /4 })
).view();
```

![Image](Loop.md.$3.png)

```JavaScript
Seq(
  { by: 1 / 8, upto: 1 },
  (t) =>
    Arc(4, { start: 3 / 8, end: 6 / 8 })
      .x(5)
      .rz(t),
  Loop
).view();
```
