from typing import List, NamedTuple, Union
from datetime import datetime


class Line(NamedTuple):
    start: Union[int, datetime]
    end: Union[int, datetime]


def get_reverse_segments(lines: List[Line], left_limit: int, right_limit: int, filter=True):
    result = []

    if filter:
        filtered_lines = []

        for i, line in enumerate(lines):
            if line.end < left_limit: continue;
            elif line.start < left_limit and line.end > left_limit:
                filtered_lines.append(Line(left_limit, line.end))
            elif line.start < right_limit and line.end > right_limit:
                filtered_lines.append(Line(line.start, right_limit))
            elif line.start < left_limit and line.end > right_limit:
                filtered_lines.append(Line(left_limit, right_limit))
            else: filtered_lines.append(line)

        lines = filtered_lines

    if lines[0].start != left_limit:
        result.append(Line(left_limit, lines[0].start))

    for i, line in enumerate(lines):
        if i == len(lines) - 1: 
            if line.end != right_limit: result.append(Line(line.end, right_limit))
        else: result.append(Line(line.end, lines[i + 1].start))

    return result



def get_intersecting_segments(lines: List[Line]):
    result = []

    lines.sort(key=lambda x: x.start)

    right_most = lines[0].end

    for i, line in enumerate(lines):
        if (i == 0): continue
        if right_most > lines[i].start:
            if lines[i].end < right_most:
                result += [Line(lines[i].start, lines[i].end)]
            else:
                result += [Line(lines[i].start, right_most)]
                right_most = lines[i].end
        
        else:
            right_most = lines[i].end

    return result 

def get_union_segments(lines: List[Line], require_sorting=False):
    result = []

    if require_sorting:
        lines.sort(key=lambda l: l.start)

    left_most = lines[0].start
    right_most = lines[0].end
    for (i, line) in enumerate(lines):
        if i == 0: continue

        if lines[i].start > right_most:
            result.append(Line(left_most, right_most))
            left_most = lines[i].start
            right_most = lines[i].end
        
        else:
            right_most = max(lines[i].end, right_most)
    
    if left_most != right_most:
        result.append(Line(left_most, right_most))

    return result



def str2time(str: str, datetime_format = "%Y-%m-%dT%H:%M:%S"):
    return datetime.strptime(str, datetime_format)

if __name__ == "__main__":
    # segments = [Line(1, 3), Line(2, 5), Line(4, 7), Line(6, 20), Line(13, 14), Line(16, 22), Line(3, 7)]
    # segments = [Line(1, 3), Line(4, 5), Line(6, 7)]
    
    segments = [
        Line(str2time("2024-04-25T11:50:00"), str2time("2024-04-25T12:00:00")),
        Line(str2time("2024-04-25T10:40:00"), str2time("2024-04-25T15:30:00")),
    ]

    # result = get_intersecting_segments(segments)
    # result = get_reverse_segments(segments, 0, 10)
    result = get_union_segments(segments, require_sorting=True)
    print(result)
