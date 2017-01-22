export function insertToSortedArray(predicate, list, point) {
  let position = list.findIndex(predicate);
  if (position === -1) {
    list = list.push(point)
  } else {
    list = list.insert(position, point);
  }
  return list
}
