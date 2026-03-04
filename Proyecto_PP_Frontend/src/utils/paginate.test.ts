import paginate from "./paginate";

describe("paginate", () => {
  it("devuelve los elementos de la página solicitada", () => {
    const items = [1, 2, 3, 4, 5, 6];

    expect(paginate(items, 0, 2)).toEqual([1, 2]);
    expect(paginate(items, 1, 2)).toEqual([3, 4]);
    expect(paginate(items, 2, 2)).toEqual([5, 6]);
  });

  it("devuelve vacío si la página no tiene elementos", () => {
    const items = [1, 2, 3];

    expect(paginate(items, 5, 2)).toEqual([]);
  });
});
