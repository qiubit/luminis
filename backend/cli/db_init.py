#!/usr/bin/env python3

import sys
import urllib.request
import urllib.error
import json


def do_request(route, method='GET', data=None):
    request = urllib.request.Request(route, data=json.dumps(data).encode('utf8') if data else None,
                                     headers={'Content-Type': 'application/json'} if method in ('POST', 'PUT') else {})
    request.get_method = lambda: method

    try:
        return json.loads(urllib.request.urlopen(request).read().decode('utf8'))
    except urllib.error.HTTPError as e:
        content = json.loads(e.read().decode('utf8'))
        print('ERROR ({}): {}'.format(content['status'], content['error']))
        return None


def create_entity_type(api_address, name, series_line, meta_line, tag_line):
    series = series_line.split(',') if series_line else []
    meta = meta_line.split(',') if meta_line else []
    tags = tag_line.split(',') if tag_line else []
    do_request(api_address + '/entity_type', method='POST', data={'name': name, 'series': series, 'meta': meta,
                                                                  'tags': tags})


def get_attributes(api_address, entity_type_id):
    response = do_request(api_address + '/entity_type/{}'.format(entity_type_id))
    tag_ids = sorted(tag['id'] for tag in response['tags'])
    meta_ids = sorted(meta['id'] for meta in response['meta'])
    tag_attributes = ['tag_{}'.format(tag_id) for tag_id in tag_ids]
    meta_attributes = ['meta_{}'.format(meta_id) for meta_id in meta_ids]
    return tag_attributes + meta_attributes


def create_entity(api_address, line):
    entity_type_id, parent_id, *tags_and_meta = line.split(',')
    entity_type_id = int(entity_type_id)
    parent_id = int(parent_id) if parent_id else None
    attributes = {k: v for k, v in zip(get_attributes(api_address, entity_type_id), tags_and_meta)}
    attributes.update({'entity_type_id': entity_type_id, 'parent_id': parent_id})
    do_request(api_address + '/node', method='POST', data=attributes)


def run_init(filename, api_address):
    f = open(filename)
    lines = f.readlines()
    lines = list(map(lambda l: l[:-1], lines))  # remove newlines
    while lines and lines[0] != 'Entity':
        header = lines.pop(0)
        assert header == 'EntityType'
        create_entity_type(api_address, lines.pop(0), lines.pop(0), lines.pop(0), lines.pop(0))
        lines.pop(0)  # to ignore empty line

    while lines and lines[0]:  # end at EOF or empty line
        header = lines.pop(0)
        assert header == 'Entity'
        create_entity(api_address, lines.pop(0))
        lines.pop(0)  # ignore empty line


if __name__ == '__main__':
    if len(sys.argv) == 3:
        run_init(sys.argv[2], sys.argv[1])
    else:
        print('USAGE: {} address_to_api filename'.format(sys.argv[0]))
