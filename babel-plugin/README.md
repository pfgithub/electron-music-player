babel plugin to transform inline scss to compiled css

```javascript
$scss`
.red{
	color: red;
	&.blue{
		color: blue;
	}
}
`
```

|
v

```javascript
.red{color:red}.red.blue{color:blue}
```
