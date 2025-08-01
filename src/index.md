---
title: "tim's thoughts"
layout: "layout.njk"
---

## about me

> A brief bio goes here. I'm a software developer who loves building things and writing about it.

---

## writings

{% for post in collections.post %}
* [{{ post.data.title }}]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }}
{% endfor %}
