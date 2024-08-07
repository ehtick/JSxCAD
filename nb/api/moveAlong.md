[index](../../nb/api/index.md)
### moveAlong()
Parameter|Default|Type
---|---|---
|direction|_required_|Reference shape.
|...distances||Distances to move in mm.

See: [m](../../nb/api/m.md)

![Image](moveAlong.md.$2.png)

Box().moveAlong(Point(0, 1), 2, 3, 4, 5) moves the box by 2, 3, 4, and 5 respectively toward y+.

```JavaScript
Box()
  .moveAlong(Point(0, 1), 2, 3, 4, 5)
  .view()
  .note(
    'Box().moveAlong(Point(0, 1), 2, 3, 4, 5) moves the box by 2, 3, 4, and 5 respectively toward y+.'
  );
```

![Image](moveAlong.md.$3.png)

Box(5, 5, 5).and(faces().n(2).moveAlong(normal(), 5)) copies one face of a box and moves it 5 along its normal.

```JavaScript
Box(5, 5, 5)
  .and(faces().n(2).moveAlong(normal(), 5))
  .view()
  .note(
    'Box(5, 5, 5).and(faces().n(2).moveAlong(normal(), 5)) copies one face of a box and moves it 5 along its normal.'
  );
```
