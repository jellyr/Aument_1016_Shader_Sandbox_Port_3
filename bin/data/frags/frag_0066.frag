#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform float triHeight;
uniform float triSize;
uniform float triSize2;
uniform float accel;
uniform float accel2;
uniform float horizonYOffset;

float triangle(vec2 p, float s)
{
	float triSize2 = 0.5;
	float triHeight = .5;
	
	return max(abs(p.x) * 0.866025 + p.y * triHeight, -p.y) - s * triSize2;
}

float dist(vec2 p)
{
	float accel = 2.0;
	float accel2 = 2.0;
	
	float s = pow(accel, fract(time)+2.0);
	float d = 100.0;
	
	float triSize = 2.0;
	
	
	for (int i = 0; i < 15; i++)
	{
		p.x = abs(p.x);
		s /= accel2;
		p.x = p.x - s * triSize;
		d = min(d, triangle(vec2(p.x, p.y + s), s-p.y*p.x));
	}
	
	return d;
}

void main(void)
{
	float horizonYOffset = 0.6;
	
	vec2 uv = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	uv.y -= horizonYOffset;
	float d = dist(uv);
	
	vec3 color = vec3(0.0);
	
	if (d < 1.0) color.r = smoothstep(0.005, 0.000, abs(d));
	gl_FragColor = vec4(color, 1.0);
	//gl_FragColor = vec4(dist(uv));
}