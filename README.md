## --- Alpha version will be out soon! ---

## Synopsis

High-level data queries builder. This tool allows you to specify reusable data queries on top of multiple data sources. It currently supports Postgres, MySQL, MariaDB, SQLite3, and Oracle.

## Code Example

1) Define your data sources.
2) Define your data views.
3) Define your data sets.
4) Run queries on your predefined data sets:
	- choose data set.
	- which dimensions you want to add - these are the grouping fields.
	- which measures you want to add - these are the aggregated fields.
	- Add filters for your query.
	- Sort your data.


## Motivation

Inspired by various open source libraries, such as Birt and Jasper for Java, I wanted to create an engine for generating reports. The idea is to define the data set once and then to query it in various 
ways. Using this API, non-developers can describe the data they want to view using the predefined
data sets and a simple JSON.

## Installation

npm install kwak;

var kwak = require('kwak');

## API Reference

You can find the docs here.

## Tests

npm test
