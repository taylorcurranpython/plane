# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from .base import BaseAPIView
from plane.license.api.permissions import InstanceAdminPermission
from plane.license.models import Instance
from plane.utils.observability import get_instance_observability


class InstanceObservabilityEndpoint(BaseAPIView):
    permission_classes = [InstanceAdminPermission]

    def get(self, request):
        instance = Instance.objects.first()
        if instance is None:
            return Response(
                {"error": "Instance is not registered yet"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(get_instance_observability(instance), status=status.HTTP_200_OK)
