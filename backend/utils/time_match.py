from utils.line_calculator import (
    Line,
    get_reverse_segments,
    get_union_segments,
    str2time,
    get_intersecting_segments,
)
from datetime import datetime
from typing import List


def get_available_time(group1_events: List[Line], group2_events: List[Line]):
    # date_set = set()
    # results = []

    # group_events = [*group1_events, *group2_events]
    # for e in group_events:
    #     date_set.add((e.start.year, e.start.month, e.start.day))
    #     date_set.add((e.end.year, e.end.month, e.end.day))

    # group_events_per_day = [
    #     [
    #         event
    #         for event in group_events
    #         if (event.start.year, event.start.month, event.start.day) == date_tuple
    #     ]
    #     for date_tuple in date_set
    # ]
    # group_events_per_day = [events for events in group_events_per_day if events]

    # for events in group_events_per_day:
    #     left_limit = datetime(
    #         events[0].start.year, events[0].start.month, events[0].start.day, 9
    #     )
    #     right_limit = datetime(
    #         events[0].start.year, events[0].start.month, events[0].start.day, 22
    #     )
    #     result = get_reverse_segments(
    #         get_union_segments(events, require_sorting=True), left_limit, right_limit
    #     )
    #     results.append(result)

    result = get_union_segments([*group1_events, *group2_events], require_sorting=True)
    result = get_reverse_segments(
        result, left_limit=datetime(2024, 1, 1), right_limit=datetime(2024, 12, 31)
    )
    return result


if __name__ == "__main__":
    group1_events = [
        Line(str2time("2024-04-25T10:40:00"), str2time("2024-04-25T15:30:00")),
        Line(str2time("2024-04-25T11:50:00"), str2time("2024-04-25T12:00:00")),
        Line(str2time("2024-04-25T13:10:00"), str2time("2024-04-25T14:30:00")),
        Line(str2time("2024-04-25T16:00:00"), str2time("2024-04-25T17:00:00")),
        Line(str2time("2024-04-25T18:00:00"), str2time("2024-04-25T18:50:00")),
        Line(str2time("2024-04-26T18:00:00"), str2time("2024-04-27T18:50:00")),
    ]

    group2_events = [
        Line(str2time("2024-04-25T16:30:00"), str2time("2024-04-25T20:00:00")),
        Line(str2time("2024-04-25T21:00:00"), str2time("2024-04-25T22:00:00")),
        Line(str2time("2024-04-26T15:00:00"), str2time("2024-04-26T17:50:00")),
        Line(str2time("2024-04-20T15:00:00"), str2time("2024-04-23T17:50:00")),
    ]

    group3_events = [
        Line(str2time("2024-04-25T13:00:00"), str2time("2024-04-25T13:50:00"))
    ]

    # left_limit = str2time("2024-04-25T09:00:00")
    # right_limit = str2time("2024-04-25T22:00:00")
    # result = get_reverse_segments(get_union_segments([*group1_events, *group2_events], require_sorting=True), left_limit, right_limit)

    # group1_event_union_reverse = get_reverse_segments(get_union_segments(group1_events), left_limit, right_limit)
    # group2_event_union_reverse = get_reverse_segments(get_union_segments(group2_events), left_limit, right_limit)
    # result = get_intersecting_segments([*group1_event_union_reverse, *group2_event_union_reverse])

    # result = get_available_time(group3_events, group2_events)
    result = get_union_segments([*group2_events, *group3_events], require_sorting=True)
    result = get_reverse_segments(
        result, left_limit=datetime(2024, 1, 1), right_limit=datetime(2024, 12, 31)
    )

    print(result)
