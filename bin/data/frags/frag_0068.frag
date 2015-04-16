// made by cheery @ http://boxbase.org/

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }
//
//
//

vec3 ray_box_intersection(vec3 origin, vec3 direction, vec3 dim, vec3 pos) {
	// contribution by http://codeflow.org/
	vec3 boxMin = pos-dim;
	vec3 boxMax = pos+dim;
	vec3 fmin = (boxMin-origin)/direction;
	vec3 fmax = (boxMax-origin)/direction;
	vec3 axisMax = max(fmin, fmax);
	vec3 axisMin = min(fmin, fmax);
	float entry = max(max(axisMin.x, axisMin.y), axisMin.z);
	float exit = min(min(axisMax.x, axisMax.y), axisMax.z);
	float intersected = step(entry, exit);
	return vec3(entry, exit, intersected);
}

#define PI 3.14159265359

vec3 rotate_y(vec3 p, vec2 cs) {
	return vec3(p.x*cs.x - p.z*cs.y, p.y, p.x*cs.y + p.z*cs.x);
}
vec3 rotate_x(vec3 p, vec2 cs) {
	return vec3(p.x, p.y*cs.x - p.z*cs.y, p.y*cs.y + p.z*cs.x);
}

float getOpacity(vec3 pos){
	float result = 0.0;
	for(int i=0; i<4; i++){
		float f = float(i);
		result += snoise(vec4(pos*pow(2.0, f), time*0.2))*pow(0.5, f);
	}
	return smoothstep(0.0, 1.0, result);
}

void main( void ) {
	vec2 position = ( gl_FragCoord.xy / resolution.xy ) - 0.5;
	float aspect = resolution.x / resolution.y;
	float x_fov = 160.0 / 360.0 * PI;
	float y_fov = 1.0;
	
	vec3 origin = vec3(0.0, 0.0, -3.0);
	vec3 direction = vec3(
		sin(position.x*x_fov),
		sin(position.y*y_fov),
		cos(position.x*x_fov)*cos(position.y*y_fov)
	);
	
	float p = 1.0 * sin(time*0.2);
	vec2 cs0 = vec2(cos(p), sin(p));
	vec2 cs1 = vec2(cos(time*0.3), sin(time*0.3));
	origin = rotate_y(rotate_x(origin, cs0), cs1);
	direction = rotate_y(rotate_x(direction, cs0), cs1);	
	
	vec3 hit = ray_box_intersection(origin, direction, vec3(1.0,1.0,1.0), vec3(0.0));
	if (hit.z == 0.0) discard;
	
	vec3 result = vec3(0.0);
	
	for(int i=0; i<20; i++){
		vec3 samplePos = origin + mix(hit.y, hit.x, float(i)/20.0)*direction;
		//float opacity = smoothstep(0.0, 1.0, snoise(vec4(samplePos, time*0.2)));
		float opacity = getOpacity(samplePos);
		vec3 color = samplePos*0.5+0.5;
		result = mix(result, color, opacity);
	}
	gl_FragColor = vec4(result, 1.0);
	
}