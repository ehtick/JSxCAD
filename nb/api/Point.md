[index](../../nb/api/index.md)
### Point()
Parameter|Default|Type
---|---|---
...coordinate|[0, 0, 0]|Coordinate of the point.

Constructs a point at the coordinate.

![Image](Point.md.$2.png)

Point(1, 2, 3).and((s) => Edge(Point(), s)) shows a point at [1, 2, 3].

```JavaScript
Point(1, 2, 3)
  .and((s) => Edge(Point(), s))
  .view()
  .note(
    'Point(1, 2, 3).and((s) => Edge(Point(), s)) shows a point at [1, 2, 3].'
  );
```
