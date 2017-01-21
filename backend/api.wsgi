import os
import sys

# Change working directory so relative paths work
dirname = os.path.dirname(__file__)
os.chdir(dirname)
if dirname not in sys.path:
    sys.path.append(dirname)

from api.app import Application as application
