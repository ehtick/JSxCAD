[index](../../nb/api/index.md)
### simplify()
Parameter|Default|Type
---|---|---
{cornerThreshold}|20/360|Keep corners which turn more than this.
eps||Number of mm for point resolution.

_Check: does this actually do anything?_

![Image](simplify.md.$2_1.png)

Box(2).cut(Arc([0.5, 1.5], 0.5, { zag: 0.001 }).seq({ by: 1 / 12 }, rz))

![Image](simplify.md.$2_2.png)

```JavaScript
Box(2)
  .cut(
    Arc([0.5, 1.5], 0.5, { zag: 0.001 })
      .seq({ by: 1 / 12 }, rz)
  )
  .ez([0.1])
  .view(1)
  .note('Box(2).cut(Arc([0.5, 1.5], 0.5, { zag: 0.001 }).seq({ by: 1 / 12 }, rz))')
  .simplify()
  .view(2);
```
