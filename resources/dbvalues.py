from enum import IntEnum

class FrontendGroups(IntEnum):
    SUPERUSER = 1
    DIRECTOR = 2
    COORDINATOR = 3
    NURSE = 4

class FrontendUsers(IntEnum):
    ROOT = 1           # APL Superuser  
    SYSTEM = 2         # APL User for authomatic operations
    CLIENT_ADMIN = 3   # CLIENT User with privileges

class MobilityLevel(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3