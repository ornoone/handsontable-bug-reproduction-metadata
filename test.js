const Handsontable = require('handsontable').default;


Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))
});
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn()
  }))
});


describe('hot pristine behavior', () => {
  // same setup as below, but without the syncer doing .sync()
  let hot;
  let insert_row_above;
  let insert_row_below;
  let insert_col_start;
  let insert_col_end;
  if (false) {
    insert_row_above = 'insert_row';
    insert_row_below = 'insert_row';
    insert_col_start = 'insert_col';
    insert_col_end = 'insert_col';
  } else {
    insert_row_above = 'insert_row_above';
    insert_row_below = 'insert_row_below';
    insert_col_start = 'insert_col_start';
    insert_col_end = 'insert_col_end';
  }





  function findMeta() {
    return hot.getCellsMeta().find(meta => meta.mymeta === 'val');
  }


  beforeEach(() => {

    document.body.innerHTML = '<div id="content">' + '</div>';

    hot = new Handsontable(document.getElementById('content'), {
      data: [
        [5, 9, '=A1 + B1'],
        [null, null, null, null],
        [null, null, null, null]
      ],
      height: 'auto',
      // formulas: {
      //   engine: hyperformulaInstance,
      //   sheetName: 'Main'
      // } as any,
      licenseKey: 'non-commercial-and-evaluation'
    });
    hot.loadData([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    hot.setCellMeta(0, 0, 'mymeta', 'val');
  });


  test('test metadata update with insert row ', () => {
    expect(findMeta()).toMatchObject({ row: 0, col: 0 });
    hot.alter(insert_row_above, 0, 1);
    expect(findMeta()).toMatchObject({ row: 1, col: 0 });
    hot.alter(insert_row_below, 0, 1);
    expect(findMeta()).toMatchObject({ row: 2, col: 0 });
    hot.alter(insert_row_above, 0, 2);
    expect(findMeta()).toMatchObject({ row: 4, col: 0 });
  });


  test('test metadata update with insert col', () => {
    expect(findMeta()).toMatchObject({ col: 0, row: 0 });
    hot.alter(insert_col_start, 0, 1);
    expect(findMeta()).toMatchObject({ col: 1, row: 0 });
    hot.alter(insert_col_end, 0, 1);
    expect(findMeta()).toMatchObject({ col: 2, row: 0 });
    hot.alter(insert_col_start, 0, 2);
    expect(findMeta()).toMatchObject({ col: 4, row: 0 });
  });

  test('test metadata update with insert row then col: detailed fail', () => {
    // cause: we call getCellsMeta multiple times, but the last call return stale data
    // it seem no matter what, if we insert row and column, the result is not up to date
    expect(findMeta()).toMatchObject({ row: 0, col: 0 });
    hot.alter(insert_row_above, 0, 1);
    expect(findMeta()).toMatchObject({ row: 1, col: 0 });
    hot.alter(insert_col_start, 0, 1);
    expect(findMeta()).toMatchObject({ row: 1, col: 1 });
  });
  
  test('ok we call getCellMeta inbetween', () => {
      // workaround 1: don't call multiple time time getCellsMeta
      expect(findMeta()).toMatchObject({ row: 0, col: 0 });
      hot.alter(insert_row_above, 0, 1);
      expect(findMeta()).toMatchObject({ row: 1, col: 0 });
      hot.alter(insert_col_start, 0, 1);
      // pass because of this call
      hot.getCellMeta(1, 1);
      expect(findMeta()).toMatchObject({ row: 1, col: 1 });
  });

});
