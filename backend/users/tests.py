from django.contrib.auth import get_user_model
from django.test import TestCase

from .permissions import IsAdmin, IsManager


User = get_user_model()


class UserModelTests(TestCase):
    def test_superuser_sets_admin_role_and_staff(self):
        user = User.objects.create_user(
            username="superuser",
            email="super@example.com",
            password="password",
            is_superuser=True,
        )

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.ADMIN)
        self.assertTrue(user.is_staff)

    def test_admin_role_sets_staff(self):
        user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="password",
            role=User.Role.ADMIN,
        )

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.ADMIN)
        self.assertTrue(user.is_staff)

    def test_manager_role_is_not_staff(self):
        user = User.objects.create_user(
            username="manager",
            email="manager@example.com",
            password="password",
            role=User.Role.MANAGER,
        )

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.MANAGER)
        self.assertFalse(user.is_staff)


class PermissionTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="password",
            role=User.Role.ADMIN,
        )
        self.manager = User.objects.create_user(
            username="manager",
            email="manager@example.com",
            password="password",
            role=User.Role.MANAGER,
        )

    def test_is_admin_permission(self):
        permission = IsAdmin()

        request = type("Request", (), {"user": self.admin})
        self.assertTrue(permission.has_permission(request, None))

        request = type("Request", (), {"user": self.manager})
        self.assertFalse(permission.has_permission(request, None))

    def test_is_manager_permission(self):
        permission = IsManager()

        request = type("Request", (), {"user": self.manager})
        self.assertTrue(permission.has_permission(request, None))

        request = type("Request", (), {"user": self.admin})
        self.assertFalse(permission.has_permission(request, None))
