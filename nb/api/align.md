[index](../../nb/api/index.md)
### align()
Parameter|Default|Type
---|---|---
axes|'xyz'|The axis spec.

This produces a reference point such that shape.by(point) will move shape to that alignment position.

Axes can be specified as centered (xyz), above (>x>y>z), or below (<x<y<z), in some combination.

```JavaScript
const origin = Box(0.5, 0.5, 5)
  .and(to(YZ()), to(XZ()))
  .color('yellow')
  .overlay();
```

![Image](align.md.$2.png)

Box(10, 10, 1)

```JavaScript
Box(10, 10, 1).view().note('Box(10, 10, 1)');
```

![Image](align.md.$3.png)

align()

```JavaScript
Box(10, 10, 1).align().and(origin).view().note('align()');
```

![Image](align.md.$4.png)

align('x>')

```JavaScript
Box(10, 10, 1).align('x>').and(origin).view().note("align('x>')");
```

![Image](align.md.$5.png)

align('x<')

```JavaScript
Box(10, 10, 1).align('x<').and(origin).view().note("align('x<')");
```

![Image](align.md.$6.png)

align('x')

```JavaScript
Box(10, 10, 1).align('x').and(origin).view().note("align('x')");
```

![Image](align.md.$7.png)

align('x>y>z<')

```JavaScript
Box(10, 10, 1).align('x>y>z<').and(origin).view().note("align('x>y>z<')");
```
