'use client';
import { cn } from '../../lib/utils';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const { resolvedTheme } = useTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

        try {
            const SEPARATION = 100;
            const AMOUNTX = 60;
            const AMOUNTY = 60;

            // Scene setup
            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                10000,
            );
            camera.position.z = 1000;
            camera.position.y = 150;

            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0); // Transparent background

            containerRef.current.appendChild(renderer.domElement);

            // Create particles
            const positions: number[] = [];
            const colors: number[] = [];

            // Create geometry for all particles
            const geometry = new THREE.BufferGeometry();

            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                    const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
                    const y = 0;

                    positions.push(x, y, z);
                    
                    // Normalize colors (0.0 - 1.0)
                    if (resolvedTheme === 'dark') {
                        // Dark mode: Subtle grey-blue dots (RGB ~ 60, 70, 90)
                        colors.push(0.25, 0.28, 0.35); 
                    } else {
                        // Light mode: Darker Slate Blue dots for visibility on white background
                        // RGB ~ 76, 89, 115
                        colors.push(0.3, 0.35, 0.45);
                    }
                }
            }

            geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(positions, 3),
            );
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // Create material
            const material = new THREE.PointsMaterial({
                size: 3.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true,
            });

            // Create points object
            const points = new THREE.Points(geometry, material);
            scene.add(points);

            let count = 0;
            let animationId: number;

            // Animation function
            const animate = () => {
                animationId = requestAnimationFrame(animate);

                const positionAttribute = geometry.attributes.position;
                const positions = positionAttribute.array as Float32Array;

                let i = 0;
                for (let ix = 0; ix < AMOUNTX; ix++) {
                    for (let iy = 0; iy < AMOUNTY; iy++) {
                        const index = i * 3;
                        // Wave animation
                        positions[index + 1] = (Math.sin((ix + count) * 0.3) * 30) + (Math.sin((iy + count) * 0.5) * 30);
                        i++;
                    }
                }

                positionAttribute.needsUpdate = true;
                renderer.render(scene, camera);
                count += 0.05; // Smooth speed
            };

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);
            animate();

            sceneRef.current = {
                scene,
                camera,
                renderer,
                particles: [points],
                animationId,
                count,
            };
        } catch (error) {
            console.error("Three.js init error:", error);
        }

		return () => {
			window.removeEventListener('resize', () => {});
			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);
                // Dispose resources
				sceneRef.current.scene.clear();
				sceneRef.current.renderer.dispose();
				if (containerRef.current && containerRef.current.contains(sceneRef.current.renderer.domElement)) {
					containerRef.current.removeChild(sceneRef.current.renderer.domElement);
				}
			}
		};
	}, [resolvedTheme]);

	return (
		<div
			ref={containerRef}
            // z-0 ensures it is visible on top of background-color but behind z-10 content
			className={cn('pointer-events-none fixed inset-0 z-0', className)}
			{...props}
		/>
	);
}