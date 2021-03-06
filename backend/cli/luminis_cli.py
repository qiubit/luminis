#!/usr/bin/env python3

#
# Copyright (C) 2017 Paweł Goliński
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import urllib.request
import urllib.error
import json
import re
import configparser


# configuration
BASE_URL = ''


# resources
ENTITY_TYPE_COMMANDS = '''Available commands:
a      -> add new entity type
d <ID> -> delete selected entity type, e.g. "d 1" -> delete entity type #1
e <ID> -> edit selected entity type, e.g. "e 1" -> edit entity type #1
? <ID> -> print information about selected entity type
h      -> print this command list
q      -> go back
'''

ENTITY_TYPE_EDIT_COMMANDS = '''Available commands:
a       -> add new attributes
dt <ID> -> delete tag attribute
dm <ID> -> delete meta attribute
ds <ID> -> delete series attribute
em <ID> -> edit meta attribute
es <ID> -> edit series attribute
h       -> print this command list
n       -> edit name of entity type
q       -> go back
'''

ENTITY_COMMANDS = '''Available commands:
a      -> add new root
a <ID> -> add new child to selected node, e.g. "a 1" -> add child to node #1
e <ID> -> edit selected node
d <ID> -> delete node
p      -> go to parent node in tree visualization
g <ID> -> go to selected node in tree visualization
? <ID> -> print information about selected node
h      -> print this command list
q      -> go back
'''

ALERT_COMMANDS = '''Available commands:
a      -> add new alert
d <ID> -> delete selected alert, e.g. "d 1" -> delete alert #1
e <ID> -> edit selected alert, e.g. "e 1" -> edit alert #1
- <ID> -> disable selected alert
+ <ID> -> enable selected alert
h      -> print this command list
q      -> go back
'''

MAIN_TYPES_OF_OBJECTS = '''Select type of objects to modify:
e -> entities
t -> entity types
a -> alerts
h -> print this help
q -> goodbye
'''

ENTITY_TYPE_REMOVE_WARNING = 'WARNING: This action will also remove all nodes of selected entity type'

CONTINUE_PROMPT = 'Are you sure you want to proceed? [y/N] '

COMMAND_PROMPT = 'Command? (h for help) '


def do_request(route, method='GET', data=None):
    request = urllib.request.Request(BASE_URL + route, data=json.dumps(data).encode('utf8') if data else None,
                                     headers={'Content-Type': 'application/json'} if method in ('POST', 'PUT') else {})
    request.get_method = lambda: method

    try:
        return json.loads(urllib.request.urlopen(request).read().decode('utf8'))
    except urllib.error.HTTPError as e:
        content = json.loads(e.read().decode('utf8'))
        print('ERROR ({}): {}'.format(content['status'], content['error']))
        return None


class EntityTypeManager(object):
    def __init__(self):
        self._cache = dict()
        self.reload_data()

    def reload_data(self):
        self._cache = dict()
        for item in do_request('/entity_type'):
            self._cache[item['id']] = item

    def add(self, **kwargs):
        do_request('/entity_type', method='POST', data=kwargs)
        self.reload_data()

    def delete(self, ident):
        do_request('/entity_type/{}'.format(ident), method='DELETE')
        self.reload_data()

    def update(self, ident, **kwargs):
        do_request('/entity_type/{}'.format(ident), method='PUT', data=kwargs)
        self.reload_data()

    def get(self, ident):
        return self._cache.get(int(ident))

    def lists(self):
        return self._cache


class TagAttributeManager(object):
    def __init__(self, entity_type_id):
        self._entity_type_id = entity_type_id

    def add(self, name):
        do_request('/entity_type/{}/tag'.format(self._entity_type_id), method='POST', data={'name': name})

    def delete(self, ident):
        do_request('/entity_type/{}/tag/{}'.format(self._entity_type_id, ident), method='DELETE')


class SeriesAttributeManager(object):
    def __init__(self, entity_type_id):
        self._entity_type_id = entity_type_id

    def add(self, name):
        do_request('/entity_type/{}/series'.format(self._entity_type_id), method='POST', data={'name': name})

    def update(self, ident, **params):
        do_request('/entity_type/{}/series/{}'.format(self._entity_type_id, ident), method='PUT', data=params)

    def delete(self, ident):
        do_request('/entity_type/{}/series/{}'.format(self._entity_type_id, ident), method='DELETE')


class MetaAttributeManager(object):
    def __init__(self, entity_type_id):
        self._entity_type_id = entity_type_id

    def add(self, name):
        do_request('/entity_type/{}/meta'.format(self._entity_type_id), method='POST', data={'name': name})

    def update(self, ident, name):
        do_request('/entity_type/{}/meta/{}'.format(self._entity_type_id, ident), method='PUT', data={'name': name})

    def delete(self, ident):
        do_request('/entity_type/{}/meta/{}'.format(self._entity_type_id, ident), method='DELETE')


class AlertManager(object):
    def __init__(self):
        self._cache = dict()
        self.reload_data()

    def reload_data(self):
        self._cache = dict()
        for item in do_request('/alert'):
            self._cache[item['id']] = item

    def add(self, **kwargs):
        do_request('/alert', method='POST', data=kwargs)
        self.reload_data()

    def update(self, ident, **kwargs):
        do_request('/alert/{}'.format(ident), method='PUT', data=kwargs)
        self.reload_data()

    def delete(self, ident):
        do_request('/alert/{}'.format(ident), method='DELETE')
        self.reload_data()

    def get(self, ident):
        return self._cache.get(int(ident))

    def lists(self):
        return self._cache


class EntityManager(object):
    def __init__(self):
        self._cache = dict()
        self.reload_data()

    def reload_data(self):
        self._cache = dict()
        for node in do_request('/node'):
            del node['series']
            self._cache[node['id']] = node

    def add(self, **kwargs):
        do_request('/node', method='POST', data=kwargs)
        self.reload_data()

    def update(self, ident, **kwargs):
        do_request('/node/{}'.format(ident), method='PUT', data=kwargs)
        self.reload_data()

    def delete(self, ident):
        do_request('/node/{}'.format(ident), method='DELETE')
        self.reload_data()

    def get(self, ident):
        return self._cache.get(int(ident))

    def lists(self):
        return self._cache


def get_config(filename):
    result = {}
    config = configparser.ConfigParser()
    config.read(filename)

    params = {"api_url": str}
    for param in params:
        result[param] = params[param](config.get("cli", param))
    return result


def get_input(text):
    return ' '.join(input(text).split())


def process_prompt(prompt_text, handlers):
    while True:
        answer = get_input(prompt_text)
        for regex, callback, *no_return in handlers:
            if re.match(regex, answer):
                callback(*re.match(regex, answer).groups())
                if len(no_return) == 0 or not no_return[0]:
                    return


def get_attributes():
    result = {'tag': [], 'meta': [], 'series': []}
    for attr_type in result:
        while True:
            a = get_input('Name of {} attribute or empty for end of list? '.format(attr_type))
            if a == '':
                break
            else:
                result[attr_type].append(a)
    return result


def entity_type_add(manager):
    name = get_input('Name of entity type? ')
    attributes = get_attributes()
    manager.add(name=name, tags=attributes['tag'], meta=attributes['meta'], series=attributes['series'])


def entity_type_print(manager, ident):
    t = manager.get(ident)
    print('Name: {}'.format(t['name']))
    print('Tags: {}'.format(', '.join('{} ({})'.format(tag['id'], tag['name']) for tag in t['tags'])))
    print('Series: {}'.format(', '.join(
              '{} ({}){}'.format(series['id'], series['name'], '*' if series['is_favourite'] else '')
              for series in t['series'])))
    print('Meta: {}'.format(', '.join('{} ({})'.format(meta['id'], meta['name']) for meta in t['meta'])))
    print()


def entity_type_update(manager, ident):
    def attribute_add():
        attributes = get_attributes()
        manager.update(ident, tags=attributes['tag'], meta=attributes['meta'], series=attributes['series'])

    def edit_name():
        name = get_input('Name of entity type? ')
        manager.update(ident, name=name)

    def meta_edit(meta_ident):
        name = get_input('Name of meta attribute? ')
        MetaAttributeManager(ident).update(meta_ident, name=name)
        manager.reload_data()

    def series_edit(series_ident):
        params = dict()
        process_prompt('Refresh time or empty if no change? ', (
            ('\s*(\d*)\s*', lambda t: params.update({'refresh_time': int(t) if t else None})),
        ))
        process_prompt('Should this series be favourite [y/n] (empty if no change)? ', (
            ('\s*([yn]?)\s*', lambda t: params.update({'is_favourite': True if t == 'y' else False} if t else {})),
        ))
        SeriesAttributeManager(ident).update(series_ident, **params)

    def delete_attribute(manager_cls, attr_ident):
        manager_cls(ident).delete(attr_ident)
        manager.reload_data()

    def back():
        go_back[0] = True

    go_back = [False]

    while not go_back[0]:
        entity_type_print(manager, ident)
        process_prompt('Command? (h for help) ', (
            ('\s*a', attribute_add),
            ('\s*dt\s*(\d+)\s*', lambda attr_ident: delete_attribute(TagAttributeManager, attr_ident)),
            ('\s*dm\s*(\d+)\s*', lambda attr_ident: delete_attribute(MetaAttributeManager, attr_ident)),
            ('\s*ds\s*(\d+)\s*', lambda attr_ident: delete_attribute(SeriesAttributeManager, attr_ident)),
            ('\s*em\s*(\d+)\s*', meta_edit),
            ('\s*es\s*(\d+)\s*', series_edit),
            ('\s*h\s*', lambda: print(ENTITY_TYPE_EDIT_COMMANDS), True),
            ('\s*n\s*', edit_name),
            ('\s*q\s*', back),
        ))


def entity_type_delete(manager, ident):
    print(ENTITY_TYPE_REMOVE_WARNING)
    process_prompt(CONTINUE_PROMPT, (
        ('\s*y\s*', lambda: manager.delete(ident)),
        ('\s*n?\s*', lambda: None)
    ))


def entity_add(manager, entity_type_manager, ident):
    data = {'parent_id': None if ident is None else int(ident)}
    print('Known entity types:')
    for k, v in entity_type_manager.lists().items():
        print('{} -> {}'.format(k, v['name']))
    print()
    process_prompt('Entity type ID? ', (
        ('\s*(\d+)\s*', lambda entity_type_id: data.update({'entity_type_id': int(entity_type_id)})),
    ))
    entity_type = entity_type_manager.get(data['entity_type_id'])
    if entity_type:
        for tag in entity_type['tags']:
            process_prompt('Value for tag {}? '.format(tag['name']), (
                ('^(.+)$', lambda value: data.update({'tag_{}'.format(tag['id']): value})),
            ))
        for meta in entity_type['meta']:
            process_prompt('Value for meta {}? '.format(meta['name']), (
                ('^(.+)$', lambda value: data.update({'meta_{}'.format(meta['id']): value})),
            ))
        manager.add(**data)
    else:
        print('ERROR: entity type does not exist')


def entity_edit(manager, entity_type_manager, ident):
    node = manager.get(ident)
    entity_type = entity_type_manager.get(node['entity_type_id'])
    data = dict()
    process_prompt('New parent ID or empty if no change? ', (
        ('\s*(\d*)\s*', lambda parent_id: data.update({'parent_id': int(parent_id)} if parent_id else {})),
    ))
    for tag in entity_type['tags']:
        process_prompt('Value for tag {} or empty if no change? '.format(tag['name']), (
            ('^(.*)$', lambda value: data.update({'tag_{}'.format(tag['id']): value} if value else {})),
        ))
    for meta in entity_type['meta']:
        process_prompt('Value for meta {} or empty if no change? '.format(meta['name']), (
            ('^(.*)$', lambda value: data.update({'meta_{}'.format(meta['id']): value} if value else {})),
        ))
    manager.update(ident, **data)


def alert_add(alert_manager):
    entity_id = int(get_input('ID of entity? '))
    series_id = int(get_input('ID of series? '))
    alert_predicate_type = get_input('Type of alert (one of data_delay, value_too_low, value_too_high? ')
    value = []
    process_prompt('Value of alert? ', (
        ('\s*(\d+\.?\d*)\s*', lambda v: value.append(float(v))),
    ))
    is_enabled = []
    process_prompt('Is enabled (y/n)? ', (
        ('\s*([YNyn])\s*', lambda v: is_enabled.append(v in ('y', 'Y'))),
    ))
    alert_recipient_email = get_input('Alert recipient email? ')
    alert_manager.add(entity_id=entity_id, series_id=series_id, alert_predicate_type=alert_predicate_type,
                      value=value[0], is_enabled=is_enabled[0], alert_recipient_email=alert_recipient_email)


def entity_type_main():
    def try_update(ident):
        if manager.get(ident):
            entity_type_update(manager, ident)
        else:
            print('ERROR: entity type does not exist')

    def try_delete(ident):
        if manager.get(ident):
            entity_type_delete(manager, ident)
        else:
            print('ERROR: entity type does not exist')

    def back():
        go_back[0] = True

    manager = EntityTypeManager()
    go_back = [False]  # enables modification in inner function

    while not go_back[0]:
        print('Known entity types:')
        for k, v in manager.lists().items():
            print('{} -> {}'.format(k, v['name']))
        print()
        process_prompt(COMMAND_PROMPT, (
            ('\s*a\s*', lambda: entity_type_add(manager)),
            ('\s*e\s*(\d+)\s*', try_update),
            ('\s*d\s*(\d+)\s*', try_delete),
            ('\s*\?\s*(\d+)\s*', lambda ident: entity_type_print(manager, ident), True),
            ('\s*h\s*', lambda: print(ENTITY_TYPE_COMMANDS), True),
            ('\s*q\s*', back),
        ))


def entity_main():
    def try_add(ident=None):
        if ident is None or manager.get(ident):
            entity_add(manager, entity_type_manager, ident)
        else:
            print('ERROR: parent entity does not exist')

    def try_edit(ident):
        if manager.get(ident):
            entity_edit(manager, entity_type_manager, ident)
        else:
            print('ERROR: entity does not exist')

    def try_delete(ident):
        if manager.get(ident):
            manager.delete(ident)
        else:
            print('ERROR: entity does not exist')

    def back():
        go_back[0] = True

    def go_parent():
        if current_node[0] is None:
            print('ERROR: Currently at the roots')
        else:
            current_node[0] = manager.get(current_node[0])['parent_id']
            if current_node[0] is not None:
                current_node[0] = str(current_node[0])

    def go_to(ident):
        if manager.get(ident):
            current_node[0] = ident
        else:
            print('ERROR: entity does not exist')

    def print_node(ident):
        node = manager.get(ident)
        print('Parent ID: {}'.format(node['parent_id']))
        print('Tags: {}'.format(', '.join('{}: {}'.format(k, v) for k, v in node['tags'].items())))
        print('Meta: {}'.format(', '.join('{}: {}'.format(k, v) for k, v in node['meta'].items())))
        print()

    def print_nodes(ident):
        node = manager.get(ident)
        print('{}: {}'.format(ident, node['meta'].get('name', '')))
        for child in node['children_ids']:
            child_node = manager.get(child)
            print('\_ {}: {}'.format(child, child_node['meta'].get('name', '')))
            if child_node['children_ids']:
                print('   \_ ...')  # this child is not a leaf

    entity_type_manager = EntityTypeManager()
    manager = EntityManager()
    go_back = [False]  # enables modification in inner function
    current_node = [None]

    while not go_back[0]:
        if current_node[0] is None:
            for root in filter(lambda node: manager.get(node)['parent_id'] is None, manager.lists()):
                print_nodes(root)
        else:
            print_nodes(current_node[0])

        process_prompt(COMMAND_PROMPT, (
            ('\s*a(?:\s*(\d+))?\s*', try_add),
            ('\s*e\s*(\d+)\s*', try_edit),
            ('\s*d\s*(\d+)\s*', try_delete),
            ('\s*p\s*', go_parent),
            ('\s*g\s*(\d+)\s*', go_to),
            ('\s*\?\s*(\d+)\s*', print_node, True),
            ('\s*h\s*', lambda: print(ENTITY_COMMANDS), True),
            ('\s*q\s*', back)
        ))


def alert_main():
    def try_update(ident):
        if alert_manager.get(ident):
            value = float(get_input('New value? '))
            alert_manager.update(ident, value=value)
        else:
            print('ERROR: alert does not exist')

    def try_delete(ident):
        if alert_manager.get(ident):
            alert_manager.delete(ident)
        else:
            print('ERROR: alert does not exist')

    def format_alert(alert):
        entity = entity_manager.get(alert['entity_id'])
        entity_type = entity_type_manager.get(entity['entity_type_id'])
        series = list(filter(lambda s: s['id'] == alert['series_id'], entity_type['series']))[0]
        return '{} of series {} ({}) of entity {} ({}) {} {}{}'.format(
            'Data delay' if alert['alert_predicate_type'] == 'data_delay' else 'Value',
            alert['series_id'],
            series['name'],
            alert['entity_id'],
            entity['meta'].get('name', 'UNKNOWN'),
            '<' if alert['alert_predicate_type'] == 'value_too_low' else '>',
            alert['value'],
            ' (not active)' if not alert['is_enabled'] else '',
        )

    def deactivate(ident):
        if alert_manager.get(ident):
            alert_manager.update(ident, is_enabled=False)
        else:
            print('ERROR: alert does not exist')

    def activate(ident):
        if alert_manager.get(ident):
            alert_manager.update(ident, is_enabled=True)
        else:
            print('ERROR: alert does not exist')

    def back():
        go_back[0] = True

    entity_type_manager = EntityTypeManager()
    entity_manager = EntityManager()
    alert_manager = AlertManager()
    go_back = [False]  # enables modification in inner function

    while not go_back[0]:
        print('Alerts:')
        for k, v in alert_manager.lists().items():
            print('{} -> {}'.format(k, format_alert(v)))
        print()

        process_prompt(COMMAND_PROMPT, (
            ('\s*a\s*', lambda: alert_add(alert_manager)),
            ('\s*e\s*(\d+)\s*', try_update),
            ('\s*d\s*(\d+)\s*', try_delete),
            ('\s*-\s*(\d+)\s*', deactivate),
            ('\s*\+\s*(\d+)\s*', activate),
            ('\s*h\s*', lambda: print(ALERT_COMMANDS), True),
            ('\s*q\s*', back)
        ))


def main():
    global BASE_URL

    config = get_config("config/cli.ini")
    BASE_URL = config["api_url"]

    def exit_main():
        to_exit[0] = True

    print(MAIN_TYPES_OF_OBJECTS)
    to_exit = [False]

    while not to_exit[0]:
        try:
            process_prompt(COMMAND_PROMPT, (
                ('\s*t\s*', entity_type_main),
                ('\s*e\s*', entity_main),
                ('\s*a\s*', alert_main),
                ('\s*h\s*', lambda: print(MAIN_TYPES_OF_OBJECTS), True),
                ('\s*q\s*', exit_main),
            ))
        except (EOFError, KeyboardInterrupt):
            break


if __name__ == '__main__':
    main()
