[index](../../nb/api/index.md)
### loft(...shapes)
Parameter|Default|Type
---|---|---
...shapes||Shapes to loft between.
'open'|false|Cap the ends of the loft.

Lofts a surface between pairs of shapes, potentially forming a volume.

Note that the incoming shape provides context but is not automatically included in the loft.

_Note: loft is a work in progress and has limited functionality._

```JavaScript
Box(5)
  .loft(z(0), z(5).rz(1 / 8))
  .view()
  .note(
    'Box(5).loft(z(0), z(5).rz(1 / 8)) lofts a Box by 5 mm with a 1/8 rotation.'
  );
```

![Image](loft.md.0.png)

Box(5).loft(z(0), z(5).rz(1 / 8)) lofts a Box by 5 mm with a 1/8 rotation.

```JavaScript
Box(5)
  .loft(z(0), Arc(4).z(5))
  .view()
  .note('Box(5).loft(z(0), Arc(4).z(5)) lofts a box by 5 mm to a circle.');
```

![Image](loft.md.1.png)

Box(5).loft(z(0), Arc(4).z(5)) lofts a box by 5 mm to a circle.

```JavaScript
Box(5)
  .cut(inset(1))
  .loft(z(0), Arc(4).cut(inset(1)).z(5))
  .view()
  .note(
    'Box(5).cut(inset(1)).loft(z(0), Arc(4).cut(inset(1)).z(5)) lofts a box with a hole to a circle with a hole'
  );
```

![Image](loft.md.2.png)

Box(5).cut(inset(1)).loft(z(0), Arc(4).cut(inset(1)).z(5)) lofts a box with a hole to a circle with a hole