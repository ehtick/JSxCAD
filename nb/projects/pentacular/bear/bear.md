### Bear model sliced

```JavaScript
const url = control('url', 'https://raw.githubusercontent.com/jsxcad/JSxCAD/master/nb/projects/pentacular/bear/bear.stl', 'input');
```

```JavaScript
const height = control('height', 200, 'input');
```

```JavaScript
const spacing = control('spacing', 2, 'input');
```

```JavaScript
const a = LoadStl(url, 'patch').align('z>');
```

![Image](bear.md.$2_bear.png)

[bear.stl](bear.bear.stl)

This is a low-poly model of a bear.

```JavaScript
a.stl('bear').note('This is a low-poly model of a bear.');
```

Stl sliced each 2mm up to 200mm.

![Image](bear.md.$3.png)

Laid out on a single sheet for cutting.

![Image](bear.md.$3_slices.png)

[slices.pdf](bear.slices.pdf)

```JavaScript
a.section(seq({ to: height, by: spacing }, XY, Group))
  .note(`Stl sliced each ${spacing}mm up to ${height}mm.`)
  .view()
  .note('Laid out on a single sheet for cutting.')
  .pdf('slices', each(flat()).pack('bb'));
```
