#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser
import email.utils
from email.mime.text import MIMEText
from smtplib import SMTP, SMTP_SSL
from typing import Tuple

from database.model import Alert


def get_smtp_connection(config_file='config/alert.ini') -> Tuple[SMTP, str]:
    """ Reads needed configuration values from given file and returns
    them as a dict.
    """
    config_values = {}
    config = configparser.ConfigParser()
    config.read(config_file)

    params = {'host': str, 'port': int, 'connection_type': str, 'username': str, 'password': str, 'sender_email': str}
    for param in params:
        config_values[param] = params[param](config.get("SMTP", param))
    if config_values['connection_type'] in ('plain', 'starttls'):
        connection = SMTP(config_values['host'], config_values['port'])
        if config_values['connection_type'] == 'starttls':
            connection.starttls()
    elif config_values['connection_type'] in 'ssl':
        connection = SMTP_SSL(config_values['host'], config_values['port'])
    else:
        raise ValueError('Invalid connection type ' + config_values['connection_type'])
    connection.login(config_values['username'], config_values['password'])
    return connection, config_values['sender_email']


def send_mail(alert: Alert, message: str):
    connection, sender = get_smtp_connection()
    msg = MIMEText(message)
    msg['Subject'] = 'Luminis alert'
    msg['From'] = sender
    msg['To'] = alert.alert_recipient_email
    msg['Date'] = email.utils.formatdate(localtime=True)
    connection.send_message(msg)
    connection.quit()
