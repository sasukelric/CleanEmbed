"""Dessine l'icône de l'extension (maillon de chaîne blanc sur carré bleu) aux tailles du manifest.

Usage : python -I scripts/icones.py   (depuis le dossier cleanembed ; nécessite Pillow)
"""
from pathlib import Path

from PIL import Image, ImageDraw

BLEU = (29, 155, 240, 255)
BLANC = (255, 255, 255, 255)
GRAND = 1024  # dessin en grand puis réduction, pour des bords lisses
TAILLES = (16, 32, 48, 128)

dossier = Path(__file__).resolve().parent.parent / 'icons'
dossier.mkdir(exist_ok=True)

fond = Image.new('RGBA', (GRAND, GRAND), (0, 0, 0, 0))
ImageDraw.Draw(fond).rounded_rectangle((0, 0, GRAND - 1, GRAND - 1), radius=230, fill=BLEU)

# Deux maillons qui se chevauchent, dessinés à plat puis tournés de 45°
maillons = Image.new('RGBA', (GRAND, GRAND), (0, 0, 0, 0))
trait = ImageDraw.Draw(maillons)
largeur, hauteur, epaisseur = 440, 240, 64
for centre_x in (GRAND / 2 - 190, GRAND / 2 + 190):
    trait.rounded_rectangle(
        (centre_x - largeur / 2, GRAND / 2 - hauteur / 2, centre_x + largeur / 2, GRAND / 2 + hauteur / 2),
        radius=hauteur / 2, outline=BLANC, width=epaisseur)
maillons = maillons.rotate(45, resample=Image.BICUBIC, center=(GRAND / 2, GRAND / 2))

icone = Image.alpha_composite(fond, maillons)
for taille in TAILLES:
    icone.resize((taille, taille), Image.LANCZOS).save(dossier / f'icon-{taille}.png', optimize=True)
    print(dossier / f'icon-{taille}.png')
