[index](../../nb/api/index.md)
### eachEdge
Parameter|Default|Type
---|---|---
edgeOp|(edge, lendth) => edge|
faceOp|(edges, face) => edges|
groupOp|Group|
...selections||Shapes to delimit edges.

Each edge is independently oriented.

## See also
[Edge](../../nb/api/Edge.md)

```JavaScript
Box(5, 5, 5)
  .eachEdge((edge, length) =>
    Arc(0.5, [0.2, 0.7], [length])
      .hasAngle(0 / 4, 2 / 4)
      .to(edge)
  )
  .view()
  .note(
    'Box(5, 5, 5).eachEdge((edge, length) => Arc(0.5, [0.2, 0.7], [length]).hasAngle(0 / 4, 2 / 4).to(edge))'
  );
```

![Image](eachEdge.md.0.png)

Box(5, 5, 5).eachEdge((edge, length) => Arc(0.5, [0.2, 0.7], [length]).hasAngle(0 / 4, 2 / 4).to(edge))

```JavaScript
Box(5, 5, 5)
  .eachEdge(
    (edge, length) =>
      Arc(0.5, [0.2, 0.7], [length])
        .hasAngle(0 / 4, 2 / 4)
        .to(edge),
    (edges, face) => edges.and(face.cut(inset(1)).e(0.2))
  )
  .view()
  .note(
    'Box(5, 5, 5).eachEdge((edge, length) => Arc(0.5, [0.2, 0.7], [length]).hasAngle(0 / 4, 2 / 4).to(edge), (edges, face) => edges.and(face.cut(inset(1)).e(0.2)))'
  );
```

![Image](eachEdge.md.1.png)

Box(5, 5, 5).eachEdge((edge, length) => Arc(0.5, [0.2, 0.7], [length]).hasAngle(0 / 4, 2 / 4).to(edge), (edges, face) => edges.and(face.cut(inset(1)).e(0.2)))

```JavaScript
Box(50, 50, 50)
  .faces()
  .eachEdge(
    (e, l) => e,
    (e, f) => f
  )
  .material('glass')
  .each(flat())
  .pack()
  .view();
```

![Image](eachEdge.md.2.png)