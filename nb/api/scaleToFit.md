[index](../../nb/api/index.md)
### scaleToFit()
Parameter|Default|Type
---|---|---
...dimensions|[1, 1, 1]|Dimensions of a bounding box to fill.

The shape is scaled to fit the bounding box dimensions.

See: [scale](../../nb/api/scale.md).

_Note: Should support ranged dimensions._

![Image](scaleToFit.md.$2.png)

```JavaScript
Box(1, 1, 1).scaleToFit(1, 2, 3).view();
```

![Image](scaleToFit.md.$3.png)

```JavaScript
Box(1, 2, 3).scaleToFit(3, 2, 1).view();
```
