[index](../../nb/api/index.md)
### nth()
Parameter|Default|Type
---|---|---
...indices||The indices of the leaves to extract.

Extracts leaf geometry by index.

A shorthand operator n() is equivalent.

See: [n](../../nb/api/n.md)

![Image](nth.md.$2_1.png)

All of the lines are included.

![Image](nth.md.$2_2.png)

Line(0.1, 5).seq({ by: 1 / 8 }, rz).nth(0, 3, 6) extracts lines 0, 3, and 6.

```JavaScript
Line(0.1, 5)
  .seq({ by: 1 / 8 }, rz)
  .view(1)
  .note('All of the lines are included.')
  .nth(0, 3, 6)
  .view(2)
  .note(
    'Line(0.1, 5).seq({ by: 1 / 8 }, rz).nth(0, 3, 6) extracts lines 0, 3, and 6.'
  );
```
