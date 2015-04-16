#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

vec3 hue(float h) {
	vec3 rgb = fract(h + vec3(0.0,2.0/3.0,1.0/3.0));

	rgb = abs(rgb*2.0-1.0);
		
	return clamp(rgb*3.0-1.0,0.0,1.0);
}

vec3 toRGB(vec3 hsv) {
	return ((hue(hsv.x)-1.0)*hsv.y+1.0) * hsv.z;
}

float rnd(float v) {
	v = v * 0.27;
	return mod(v * 3.4 + v * v * 1.2 + v * v * v, 132.0) / 132.0;
}

void main(void) {
	vec2 p = gl_FragCoord.xy / resolution.y * 2.0 - vec2(resolution.x / resolution.y, 1.0);
	float tm = mod(time, 7.0);
	float d = sqrt(dot(p, p));
	float a = atan(p.x, p.y) / 3.141593 / 2.0;
	if (tm > 3.5)
		a = mod(a - d * 0.1, 1.0);
	else
		a = mod(a + d * 0.1, 1.0);
	int i = int(a * 880.0);
	float l =  mod(rnd(float(i)) + tm, 7.0) - 1.0;
	if (l > 3.0)
		l = 6.0 - l;
	vec3 col = vec3(0.0);
	if (l - 0.07 < d && l + 0.07 > d) {
		vec3 hsv = vec3(float(i) * 0.01 + time * 0.2, 1.0, 1.0);
		col = toRGB(hsv);
	}
	gl_FragColor = vec4(col, 1.0);
}