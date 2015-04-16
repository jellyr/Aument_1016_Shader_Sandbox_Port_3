// Triforce, by rafacacique - https://twitter.com/rafacaciqe
 
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
const float PI = 3.141592654;

vec4 rayColor(vec2 fragToCenterPos) {
	float d = length(fragToCenterPos);		
	fragToCenterPos = normalize(fragToCenterPos);
		
	float multiplier = 0.0;
	const float loop = 60.0;
	const float dotTreshold = 0.90;
	const float timeScale = 0.75;
	const float fstep = 10.0;
	
	// generates "loop" directions, summing the "contribution" of the fragment to it. (fragmentPos dot direction)
	float c = 0.5/(d*d);
	for (float i = 1.0; i < loop; i++) {
		float attn = c;
		attn *= 1.85*(sin(i*0.3*time)*0.5+0.5);
		float t = time*timeScale - fstep*i;
		float f = 0.25;	
		vec2 dir = vec2(cos(f*t), sin(f*t));
		float m = dot(dir, fragToCenterPos);
		m = pow(abs(m), 4.0);// * sign(m);
		//m = min(20.0, m);
		m *= float((m) > dotTreshold);
		multiplier += 0.5*attn*m/(i);
	}

	// radius for the rings around the triforce
	float r0 = 0.345;
	float r1 = r0 + 0.02;
	float r2 = r1 + 0.005;
	
	// "f" controls the intensity of the ray color
	float f = 1.0;
	if (d < r0) f = smoothstep(0.0, 1.0, d/r0);
	else if (d < r1) f = 0.75;//(d - r0) / (r1 - r0);
	else if (d < r2) f = 1.2;
		

	vec4 rayColor = vec4(0.9, 0.7, 0.3, 1.0);		
	// Applies the pattern
	float pat = abs(sin(10.0*mod(gl_FragCoord.y*gl_FragCoord.x, 1.5)));
	f += pat;
	vec4 color = f*multiplier*rayColor;
	return color;
}

// from "Real Time Collision Detection": compute barycentric coordinates for p with respect to triangle (a,b,c)
void barycentric(vec3 a, vec3 b, vec3 c, vec3 p, out float u, out float v, out float w) {
	vec3 v0 = b - a;
	vec3 v1 = c - a;
	vec3 v2 = p - a;
	
	float d00 = dot(v0, v0);
	float d01 = dot(v0, v1);
	float d11 = dot(v1, v1);	
	float d20 = dot(v2, v0);
	float d21 = dot(v2, v1);
	
	float denom = d00 * d11 - d01 * d01;
	
	v = (d11 * d20 - d01*d21) / denom;
	w = (d00 * d21 - d01*d20) / denom;
	u = 1.0 - v - w;
}

float insideTriangle(vec3 p, vec3 v0, vec3 v1, vec3 v2) {
	v0 -= p, v1 -= p, v2 -= p;
	vec3 u = cross(v1, v2);
	vec3 v = cross(v2, v0);
	vec3 w = cross(v0, v1);
	
	return float(dot(u, v) >= 0.0 && dot(u, w) >= 0.0);
}

float insideTriforce(vec3 pos, float aspect, out float u, out float v, out float w) {
	pos.y -= 0.044;
	float side = 0.3;
	
	float angle = PI*1.0/3.0;
	float sinA = sin(angle);
	float cosA = cos(angle);
	
	vec3 v0 = vec3(0.5*aspect, 0.8, 1.0);
	vec3 v1 = v0 + vec3(-side*cosA, -side*sinA, 0.0);
	vec3 v2 = v1 + vec3(2.0 * (v0.x - v1.x), 0.0, 0.0);
	
	float c = insideTriangle(pos, v0, v1, v2);
	
	// inside 1st triangle
	if (abs(c - 1.0) < 0.001) {
		barycentric(v0, v1, v2, pos, u, v, w);
		return 1.0;
	}
	
	float dx = v1.x - v0.x;	// half-side in x
	float dy = v1.y - v0.y;	// half-side in y
	v0 -= vec3(-dx, -dy, 0.0);
	v1 = v0 + vec3(-side*cosA, -side*sinA, 0.0);
	v2 = v1 + vec3(2.0 * (v0.x - v1.x), 0.0, 0.0);	
	
	c += insideTriangle(pos, v0, v1, v2);
	
	// inside 2nd triangle
	if (abs(c - 1.0) < 0.001) {
		barycentric(v0, v1, v2, pos, u, v, w);
		return 1.0;
	}	
	
	v0 += vec3(-dx*2.0, 0.0, 0.0);
	v1 = v0 + vec3(-side*cosA, -side*sinA, 0.0);
	v2 = v1 + vec3(2.0 * (v0.x - v1.x), 0.0, 0.0);	

	c += insideTriangle(pos, v0, v1, v2);
	barycentric(v0, v1, v2, pos, u, v, w);
	return c;
}

void main( void ) {

	float aspect = resolution.x / resolution.y;	
	vec3 pos = vec3(gl_FragCoord.xy / resolution.xy, 1.0);// * 2.0 - vec2(1.0);
	pos.x *= aspect;
	
	vec2 fragToCenterPos = vec2(pos.x - 0.5*aspect, pos.y - 0.5);
	vec4 rayCol = rayColor(fragToCenterPos);
	
	// barycentric coordinates of pos with respect to the triangle of the triforce it lies inside
	float u, v, w;
	float c = insideTriforce(pos, aspect, u, v, w);	

	float lim = 0.075;
	
	vec3 normal = vec3(0.0, 0.0, 1.0);
	vec3 uNormalContrib = vec3(0.0);
	vec3 vNormalContrib = vec3(0.0);
	vec3 wNormalContrib = vec3(0.0);
	
	float sinPIOver3 = sin(PI*1.0/3.0);
	float cosPIOver3 = cos(PI*1.0/3.0);
	
	// on the edge of each triangle, bend the normal in the direction of the edge
	if (u < lim) {
		float uNorm = u/lim;
		float offset = cos(0.5*PI*uNorm);
		offset *= offset;
		uNormalContrib = vec3(0.0, -offset, 0.0);
	}
	if (v < lim) {
		float vNorm = v/lim;
		float offset = -cos(0.5*PI*vNorm);
		offset *= offset;
		vNormalContrib = vec3(offset*cosPIOver3, offset*sinPIOver3, 0.0);
	}
	if (w < lim) {
		float wNorm = w/lim;
		float offset = cos(0.5*PI*wNorm);
		offset *= offset;
		wNormalContrib = vec3(-offset*cosPIOver3, offset*sinPIOver3, 0.0);
	}
	
	// sums all the contributions to form the normal
	normal += uNormalContrib + vNormalContrib + wNormalContrib;
	normal = normalize(normal);
	
	// generate a position for the view: on a circle around the center of the screen
	float freq = 1.5;
	vec3 view = vec3(0.5, 0.5, 0.0) + vec3(sin(freq*time), cos(freq*time), 2.0);
	view = normalize(view);
	
	// Apply lambertian light
	float light = dot( view, normal );
	
	// when the barycentric coordinate falls into the [minW, maxW] interval, shade with a lighter tone
	float minW = mod(1.15*time, 4.0);
	float maxW = minW + 0.3;
	float s = 1.0;
	if (w > minW && w < maxW)
		s += 0.1;
	
	vec4 triforceColor = light*c*vec4(s, s, 0.0, 0.0);
	gl_FragColor = mix(rayCol, triforceColor, c);
}
