from PIL import Image
import pygame
from sys import exit
pygame.init()
screen = pygame.display.set_mode((800, 400))
pygame.display.set_caption("Runner")
clock = pygame.time.Clock()

image = Image.open("./images/sky.jpg'")
new_image = image.resize((800, 400))
new_image.save("./images/img.jpg")

sky_surface = pygame.image.load(new_image)
ground_surface = pygame.image.load("./images/ground.png")


while True:
    #gets all events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
    #attatch surface put one surface on top of another surface
    screen.blit(sky_surface, (0, 0))
    screen.blit(ground_surface, (0, 350))

    pygame.display.update()
    clock.tick(60)
