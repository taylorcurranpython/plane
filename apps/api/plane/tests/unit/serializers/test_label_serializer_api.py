# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest

from plane.api.serializers.issue import LabelCreateUpdateSerializer


@pytest.mark.unit
@pytest.mark.django_db
class TestLabelCreateUpdateSerializerColor:
    """Colour validation and normalisation on the public API label serializer"""

    @pytest.mark.parametrize(
        "raw, expected",
        [
            ("#ff0000", "#ff0000"),
            ("#FF0000", "#ff0000"),
            ("ff0000", "#ff0000"),
            ("#abc", "#aabbcc"),
            ("ABC", "#aabbcc"),
            ("  #EF4444  ", "#ef4444"),
        ],
    )
    def test_normalises_hex_colors(self, raw, expected):
        serializer = LabelCreateUpdateSerializer(data={"name": "Bug", "color": raw})
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["color"] == expected

    @pytest.mark.parametrize("raw", ["red", "#12345", "#1234567", "#GGGGGG", "rgb(255, 0, 0)", "#"])
    def test_rejects_non_hex_colors(self, raw):
        serializer = LabelCreateUpdateSerializer(data={"name": "Bug", "color": raw})
        assert not serializer.is_valid()
        assert list(serializer.errors) == ["color"]

    def test_color_is_optional(self):
        serializer = LabelCreateUpdateSerializer(data={"name": "Bug"})
        assert serializer.is_valid(), serializer.errors
        assert "color" not in serializer.validated_data

    def test_empty_color_is_kept_empty(self):
        serializer = LabelCreateUpdateSerializer(data={"name": "Bug", "color": ""})
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["color"] == ""
