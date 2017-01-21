function equals(a, b, comparator) {
  return !comparator(a, b) && !comparator(b, a);
}

function locationOf(comparator, element, array, start, end) {
  start = start || 0;
  end = end || array.length;
  var pivot = parseInt(start + (end - start) / 2, 10);
  if (end-start <= 1 || equals(array[pivot], element, comparator)) return pivot;
  if (comparator(array[pivot], element)) {
    return locationOf(comparator, element, array, pivot, end);
  } else {
    return locationOf(comparator, element, array, start, pivot);
  }
}

// assuming comparator returns true when left < right
export function insertToSortedArray(comparator, element, array) {
  array.splice(locationOf(comparator, element, array) + 1, 0, element);
  return array;
}
