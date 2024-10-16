[index](../../nb/api/index.md)
### cutOut()
Parameter|Default|Type
---|---|---
|other|self|Shape: The shape to cut and clip against
|cutOp|self|Func: Processes the cut
|clipOp|self|Func: Processes the clip
|groupOp|Group|Func: Groups cut and clip
|'exact'|false|Mode: Use exact geometry
|'open'|false|Mode: Produce an open shell
|'noVoid'|false|Mode: Do not cut void geometry

Cut and clips shape by other, passing through the mode flags.

See: [clip](../../nb/api/cut.nb), [cut](#https://raw.githubusercontent.com/jsxcad/JSxCAD/master/nb/api/cut.md).

![Image](cutOut.md.$2.png)

Box(10).cutOut(Arc(12), color('red'), color('blue'))

```JavaScript
Box(10)
  .cutOut(Arc(12), color('red'), color('blue'))
  .clean()
  .view()
  .note("Box(10).cutOut(Arc(12), color('red'), color('blue'))");
```
